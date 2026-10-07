/**
 * Domínio: Pagamentos — relatório financeiro do organizador (RF04.7 / RF13).
 *
 * Consome GET /pagamentos/relatorio/edicao/:id (autenticado). O backend devolve
 * um resumo consolidado; a quebra por método de pagamento ainda não é exposta
 * pela API, então `porMetodo` fica vazio. Ver docs/arquitetura-frontend.md §4.
 */
import type { RelatorioFinanceiro } from "@/lib/types";
import { requestAutenticado } from "./_client";

interface RelatorioApi {
  resumo_inscricoes?: {
    total?: number;
    confirmadas?: number;
    pendentes?: number;
    canceladas?: number;
  } | null;
  resumo_financeiro?: {
    receita_total_confirmada?: string | number | null;
    valor_total_pendente?: string | number | null;
  } | null;
}

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Relatório financeiro consolidado da edição (RF13). */
export async function getRelatorioFinanceiro(
  token: string,
  idEdicao: number,
): Promise<RelatorioFinanceiro> {
  const r = await requestAutenticado<RelatorioApi>(
    `/pagamentos/relatorio/edicao/${idEdicao}`,
    token,
  );
  const insc = r.resumo_inscricoes ?? {};
  const fin = r.resumo_financeiro ?? {};
  return {
    totalInscricoes: insc.total ?? 0,
    confirmadas: insc.confirmadas ?? 0,
    pendentes: insc.pendentes ?? 0,
    canceladas: insc.canceladas ?? 0,
    receitaConfirmada: num(fin.receita_total_confirmada),
    receitaPendente: num(fin.valor_total_pendente),
    // A API ainda não detalha por método; a tabela mostra o estado vazio.
    porMetodo: [],
  };
}
