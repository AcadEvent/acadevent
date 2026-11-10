import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const revalidatePath = jest.fn();

async function carregar() {
  jest.resetModules();
  jest.doMock("next/cache", () => ({ revalidatePath }));
  revalidatePath.mockClear();

  const acoesInscricao = await import("./actions");
  const api = await import("@/lib/api");
  return { acoesInscricao, api };
}

/**
 * Confirmação de pagamento ainda roda sobre o mock em memória
 * (`getInscricoesDoEvento`/`confirmarPagamento`) porque o backend não expõe
 * leitura de inscrições por edição (issue #118).
 *
 * Observação: o relatório financeiro (`getRelatorioFinanceiro`) e o check-in
 * (`validarCheckinAction`) foram para a API real (fetch + cookie de sessão) e
 * por isso NÃO são exercitados aqui — exigiriam mockar `next/headers` e a rede;
 * são cobertos por verificação em runtime.
 */
describe("confirmação de pagamento (mock em memória)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("confirmação atualiza a lista e revalida as duas rotas", async () => {
    const { acoesInscricao, api } = await carregar();

    await acoesInscricao.confirmarPagamentoAction("insc-0002");

    const lista = await api.getInscricoesDoEvento("sitc-2026");
    const ana = lista.find((i) => i.id === "insc-0002");
    expect(ana?.statusPagamento).toBe("confirmado");

    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/inscricoes",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/pagamentos",
    );
  });

  it("id ausente rejeita a confirmação sem revalidar", async () => {
    const { acoesInscricao } = await carregar();

    await expect(
      acoesInscricao.confirmarPagamentoAction("nao-existe"),
    ).rejects.toThrow("Inscrição não encontrada.");
    expect(revalidatePath).not.toHaveBeenCalled();
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
