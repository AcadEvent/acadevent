import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const revalidatePath = jest.fn();

async function carregar() {
  jest.resetModules();
  jest.doMock("next/cache", () => ({ revalidatePath }));
  revalidatePath.mockClear();

  const acoesInscricao = await import("./actions");
  const acoesCheckin = await import("../check-in/actions");
  const api = await import("@/lib/api");
  return { acoesInscricao, acoesCheckin, api };
}

describe("gestão no mesmo mock", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("confirmação atualiza a lista, o relatório e revalida as duas rotas", async () => {
    const { acoesInscricao, api } = await carregar();
    const antes = await api.getRelatorioFinanceiro("sitc-2026");

    await acoesInscricao.confirmarPagamentoAction("insc-0002");

    const lista = await api.getInscricoesDoEvento("sitc-2026");
    const ana = lista.find((i) => i.id === "insc-0002");
    expect(ana?.statusPagamento).toBe("confirmado");

    const depois = await api.getRelatorioFinanceiro("sitc-2026");
    expect(depois.confirmadas).toBe(antes.confirmadas + 1);
    expect(depois.pendentes).toBe(antes.pendentes - 1);
    expect(depois.receitaConfirmada).toBe(antes.receitaConfirmada + 60);
    expect(depois.receitaPendente).toBe(antes.receitaPendente - 60);
    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/inscricoes",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/gerenciar/sitc-2026/pagamentos",
    );
  });

  it("check-in de pendente só passa depois da confirmação e recusa repetição", async () => {
    const { acoesInscricao, acoesCheckin } = await carregar();

    const bloqueado = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "SITC26-0002",
    );
    expect(bloqueado).toMatchObject({ ok: false, motivo: "nao_confirmado" });

    await acoesInscricao.confirmarPagamentoAction("insc-0002");

    const ok = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "sitc26-0002",
    );
    expect(ok).toMatchObject({
      ok: true,
      participante: "Ana Ribeiro",
      codigo: "SITC26-0002",
    });

    const repetido = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "SITC26-0002",
    );
    expect(repetido).toMatchObject({ ok: false, motivo: "ja_validado" });
  });

  it("rejeita código inexistente e a segunda entrada de um código já confirmado", async () => {
    const { acoesCheckin } = await carregar();

    const ausente = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "NAO-EXISTE",
    );
    expect(ausente).toMatchObject({ ok: false, motivo: "nao_encontrado" });

    const primeira = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "SITC26-0001",
    );
    expect(primeira.ok).toBe(true);

    const segunda = await acoesCheckin.validarCheckinAction(
      "sitc-2026",
      "SITC26-0001",
    );
    expect(segunda).toMatchObject({ ok: false, motivo: "ja_validado" });
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
