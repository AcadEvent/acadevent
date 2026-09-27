/**
 * Domínio: Pagamentos — relatório financeiro do organizador (RF04.7 / RF13).
 *
 * Enquanto a API real não existe, o relatório é derivado das inscrições (mock).
 * TODO(#90): trocar por GET /pagamentos/relatorio/edicao/:id quando ligar ao Nest.
 * Ver docs/arquitetura-frontend.md §4.
 */
import type { MetodoPagamento, RelatorioFinanceiro } from "@/lib/types";
import { mockInscricoes } from "@/lib/mock/inscricoes";
import { fake } from "./_client";

/** Consolida receita e contagens por status/método de um evento. */
export function getRelatorioFinanceiro(
  eventoSlug: string,
): Promise<RelatorioFinanceiro> {
  const inscricoes = mockInscricoes.filter((i) => i.eventoSlug === eventoSlug);

  const porMetodo = new Map<MetodoPagamento, { quantidade: number; total: number }>();
  let receitaConfirmada = 0;
  let receitaPendente = 0;
  let confirmadas = 0;
  let pendentes = 0;
  let canceladas = 0;

  for (const i of inscricoes) {
    if (i.statusPagamento === "confirmado") {
      confirmadas += 1;
      receitaConfirmada += i.valor;
      const metodo = i.metodoPagamento ?? "gratuito";
      const atual = porMetodo.get(metodo) ?? { quantidade: 0, total: 0 };
      porMetodo.set(metodo, {
        quantidade: atual.quantidade + 1,
        total: atual.total + i.valor,
      });
    } else if (i.statusPagamento === "pendente") {
      pendentes += 1;
      receitaPendente += i.valor;
    } else if (i.statusPagamento === "cancelado") {
      canceladas += 1;
    }
  }

  return fake({
    totalInscricoes: inscricoes.length,
    confirmadas,
    pendentes,
    canceladas,
    receitaConfirmada,
    receitaPendente,
    porMetodo: [...porMetodo.entries()].map(([metodo, v]) => ({ metodo, ...v })),
  });
}
