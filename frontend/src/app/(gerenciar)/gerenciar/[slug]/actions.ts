"use server";

/**
 * Painel do organizador (RF03.2.1). Não há endpoint único de indicadores, então
 * compomos o dashboard a partir de fontes reais: getEvento (público, define a
 * EXISTÊNCIA do evento), o relatório financeiro (contagens + receita) e o
 * cronograma (nº de atividades). As métricas são best-effort: se o evento existe
 * mas as métricas falham (ex.: token sem perfil — ver #117), o painel ainda
 * renderiza com zeros em vez de "evento não encontrado".
 */
import { getCronograma, getEvento, getRelatorioFinanceiro } from "@/lib/api";
import { getToken } from "@/lib/auth/session";
import type { DashboardEvento } from "@/lib/types";

export async function carregarDashboardAction(
  slug: string,
): Promise<DashboardEvento | null> {
  const evento = await getEvento(slug);
  if (!evento) return null;

  const token = await getToken();
  const relatorio =
    token && evento.idEdicao
      ? await getRelatorioFinanceiro(token, evento.idEdicao).catch(() => null)
      : null;
  const cronograma = evento.idEdicao
    ? await getCronograma(evento.idEdicao).catch(() => [])
    : [];

  return {
    evento: {
      slug: evento.slug,
      nome: evento.nome,
      sigla: evento.sigla,
      edicao: evento.edicao,
      status: evento.status,
      inicio: evento.inicio,
      fim: evento.fim,
      capacidade: evento.capacidade,
    },
    totalInscricoes: relatorio?.totalInscricoes ?? 0,
    inscricoesConfirmadas: relatorio?.confirmadas ?? 0,
    inscricoesPendentes: relatorio?.pendentes ?? 0,
    totalAtividades: cronograma.length,
    receitaConfirmada: relatorio?.receitaConfirmada ?? 0,
  };
}
