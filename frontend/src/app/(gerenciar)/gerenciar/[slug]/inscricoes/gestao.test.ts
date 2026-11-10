import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const revalidatePath = jest.fn();
const getToken = jest.fn<() => Promise<string | null>>();
const fetchMock = jest.fn<typeof fetch>();

function resposta(corpo: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  } as Response;
}

async function carregar() {
  jest.resetModules();
  jest.doMock("next/cache", () => ({ revalidatePath }));
  jest.doMock("@/lib/auth/session", () => ({ getToken }));
  revalidatePath.mockClear();
  getToken.mockReset().mockResolvedValue("tok-organizador");
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;

  const acoesInscricao = await import("./actions");
  const api = await import("@/lib/api");
  return { acoesInscricao, api };
}

/**
 * Lista e confirmação de pagamento usam a API real (GET
 * /inscricoes/edicao/:id e POST /pagamentos/confirmar-manual). O relatório
 * financeiro (`getRelatorioFinanceiro`) e o check-in (`validarCheckinAction`)
 * também são API real, mas exigiriam mockar `next/headers` e a rede em mais
 * pontos; são cobertos por verificação em runtime.
 */
describe("confirmação de pagamento (API real)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("confirma no backend com o token e revalida as duas rotas", async () => {
    const { acoesInscricao } = await carregar();
    fetchMock.mockResolvedValue(resposta({ inscricao: { id_inscricao_edicao: 12 } }, 201));

    await acoesInscricao.confirmarPagamentoAction("12", "sitc-2026");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/pagamentos\/confirmar-manual$/);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ id_inscricao_edicao: 12 });
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok-organizador",
    );

    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/inscricoes",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/pagamentos",
    );
  });

  it("sem sessão rejeita sem chamar o backend nem revalidar", async () => {
    const { acoesInscricao } = await carregar();
    getToken.mockResolvedValue(null);

    await expect(
      acoesInscricao.confirmarPagamentoAction("12", "sitc-2026"),
    ).rejects.toThrow("Sua sessão expirou");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("repassa a mensagem do backend e não revalida quando a confirmação falha", async () => {
    const { acoesInscricao } = await carregar();
    fetchMock.mockResolvedValue(
      resposta({ message: "Inscricao ja se encontra confirmada." }, 400),
    );

    await expect(
      acoesInscricao.confirmarPagamentoAction("12", "sitc-2026"),
    ).rejects.toThrow("ja se encontra confirmada");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("lista de inscrições do organizador (API real)", () => {
  it("mapeia a resposta do backend para a tabela de gestão", async () => {
    const { api } = await carregar();
    fetchMock.mockResolvedValue(
      resposta([
        {
          id_inscricao_edicao: 9,
          status: "Confirmada",
          participante: { nome: "Ana Souza", email: "ana@teste.com" },
          lote: { id_lote: 3, nome_lote: "Lote Único", preco: 50 },
          cupom: null,
          pagamento: {
            status: "Aprovado",
            valor: 45,
            metodo_pagamento: "pix",
            data_pagamento: "2026-12-01T10:00:00.000Z",
          },
          atividades_inscritas: 2,
        },
        {
          id_inscricao_edicao: 8,
          status: "Pendente",
          participante: { nome: "Bia Lima", email: "bia@teste.com" },
          lote: { id_lote: 3, nome_lote: "Lote Único", preco: 50 },
          cupom: null,
          pagamento: null,
          atividades_inscritas: 0,
        },
      ]),
    );

    const lista = await api.getInscricoesDoEvento("tok", 5, "sitc-2026");

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/inscricoes\/edicao\/5$/);
    expect(lista).toHaveLength(2);
    expect(lista[0]).toMatchObject({
      id: "9",
      eventoSlug: "sitc-2026",
      participante: "Ana Souza",
      participanteEmail: "ana@teste.com",
      statusPagamento: "confirmado",
      valor: 45,
      loteNome: "Lote Único",
      pagaEm: "2026-12-01T10:00:00.000Z",
    });
    // Pendente: sem pagamento registrado vale o preço do lote e não há data.
    expect(lista[1]).toMatchObject({
      id: "8",
      statusPagamento: "pendente",
      valor: 50,
      pagaEm: undefined,
    });
  });

  it("propaga o 403 de quem não é organizador do evento", async () => {
    const { api } = await carregar();
    fetchMock.mockResolvedValue(
      resposta({ message: "Apenas o organizador do evento..." }, 403),
    );

    await expect(
      api.getInscricoesDoEvento("tok", 5, "sitc-2026"),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe("clientes chamam as actions", () => {
  it("a tabela e o formulário não importam as mutações de @/lib/api", () => {
    const gestao = readFileSync(
      path.join(__dirname, "InscricoesGestao.tsx"),
      "utf8",
    );
    const checkin = readFileSync(
      path.join(__dirname, "../check-in/CheckinForm.tsx"),
      "utf8",
    );

    expect(gestao).toContain('from "./actions"');
    expect(gestao).not.toContain('from "@/lib/api"');
    expect(checkin).toContain('from "./actions"');
    expect(checkin).not.toContain('from "@/lib/api"');
  });
});
