/**
 * ROTA: /eventos/[slug]/atividades
 * OWNER: Igor   RF: RF01.5.2, RF05.1   PRIORIDADE: MVP
 * PROPÓSITO: Lista pública de atividades do evento (via GET /atividades/cronograma).
 * COMPONENTES: Container, PageHeader, Grid, AtividadeCard, EmptyState, Alert
 * DADOS: getEvento(slug) + getCronograma(idEdicao) (via @/lib/api — sem fetch direto)
 * ESTADOS: erro (Alert) / vazio (EmptyState) — dados reais do backend.
 * DONE: responsivo, tokens do tema, cartões linkam para o detalhe.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import AtividadeCard from "@/components/domain/AtividadeCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getCronograma, getEvento } from "@/lib/api";
import type { Atividade, Evento } from "@/lib/types";

export const metadata: Metadata = { title: "Atividades" };

export default async function AtividadesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let atividades: Atividade[];
  try {
    evento = await getEvento(slug);
    atividades =
      evento?.idEdicao != null ? await getCronograma(evento.idEdicao) : [];
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar as atividades. Tente novamente mais tarde.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Atividades"
        subtitle={evento ? evento.nome : undefined}
      />

      {atividades.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade publicada"
          description="As atividades deste evento ainda não foram divulgadas."
        />
      ) : (
        <Grid container spacing={2}>
          {atividades.map((atividade) => (
            <Grid key={atividade.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <AtividadeCard
                atividade={atividade}
                href={`/eventos/${slug}/atividades/${atividade.id}`}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
