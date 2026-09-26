/**
 * ROTA: /gerenciar/[slug]/inscricoes
 * OWNER: Arthur   RF: RF04.1, RF04.5, RF03.2.3   PRIORIDADE: MVP
 * PROPÓSITO: Gestão de inscrições do evento — lista os inscritos e permite a
 *   confirmação manual de pagamento (RF04.5). Lotes/cupons ficam para depois.
 * COMPONENTES: PageHeader, Table + Dialog (InscricoesGestao), Chip, EmptyState
 * DADOS: getEvento(slug), getInscricoesDoEvento(slug) (via @/lib/api)
 * ESTADOS: vazio (EmptyState) / erro (Alert). loading em ./loading.tsx (se houver).
 * DONE: responsivo, tokens do tema, estados cobertos.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getEvento, getInscricoesDoEvento } from "@/lib/api";
import type { Evento, InscricaoEdicao } from "@/lib/types";

import InscricoesGestao from "./InscricoesGestao";

export const metadata: Metadata = {
  title: "Inscrições",
};

export default async function InscricoesGestaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let inscricoes: InscricaoEdicao[];
  try {
    [evento, inscricoes] = await Promise.all([
      getEvento(slug),
      getInscricoesDoEvento(slug),
    ]);
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar as inscrições. Tente novamente mais tarde.
      </Alert>
    );
  }

  const total = inscricoes.length;
  const confirmadas = inscricoes.filter(
    (i) => i.statusPagamento === "confirmado",
  ).length;

  return (
    <>
      <PageHeader
        title="Inscrições"
        subtitle={
          evento
            ? `${evento.nome} · ${confirmadas}/${total} confirmadas`
            : "Inscritos e confirmação de pagamento"
        }
      />

      {total === 0 ? (
        <EmptyState
          title="Nenhuma inscrição"
          description="Ainda não há inscrições neste evento."
        />
      ) : (
        <InscricoesGestao inscricoes={inscricoes} />
      )}
    </>
  );
}
