/**
 * ROTA: /eventos/[slug]/atividades/[id]
 * OWNER: Igor   RF: RF05.1   PRIORIDADE: MVP
 * PROPÓSITO: Detalhe público de uma atividade (horário, local, ministrantes, ementa).
 * COMPONENTES: Container, PageHeader, Chip, Stack, EmptyState, Alert
 * DADOS: getEvento(slug) + getCronograma(idEdicao) (via @/lib/api — sem fetch direto)
 * ESTADOS: erro (Alert) / não encontrada (EmptyState) — dados reais do backend.
 * DONE: responsivo, tokens do tema, sem e-mail de ministrante (privacidade).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { rotuloTipo } from "@/components/domain/AtividadeCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getCronograma, getEvento } from "@/lib/api";
import { formatDiaLongo, formatIntervaloHora } from "@/lib/datas";
import type { Atividade, Evento } from "@/lib/types";

export const metadata: Metadata = { title: "Atividade" };

export default async function AtividadeDetalhePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  let evento: Evento | null;
  let atividades: Atividade[];
  try {
    evento = await getEvento(slug);
    atividades =
      evento?.idEdicao != null ? await getCronograma(evento.idEdicao) : [];
  } catch {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar esta atividade. Tente novamente mais tarde.
        </Alert>
      </Container>
    );
  }

  const atividade = atividades.find((a) => a.id === id);

  if (!atividade) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <EmptyState
          title="Atividade não encontrada"
          description="Esta atividade não existe ou não faz parte do cronograma."
          action={
            <Button href={`/eventos/${slug}/cronograma`} variant="contained">
              Ver cronograma
            </Button>
          }
        />
      </Container>
    );
  }

  const dia = formatDiaLongo(atividade.inicio);
  const horario = formatIntervaloHora(atividade.inicio, atividade.fim);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title={atividade.titulo}
        subtitle={evento ? evento.nome : undefined}
      />

      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={rotuloTipo(atividade)} color="primary" />
          {atividade.cargaHoraria != null && (
            <Chip label={`${atividade.cargaHoraria}h`} variant="outlined" />
          )}
        </Stack>

        {(dia || horario) && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <ScheduleIcon fontSize="small" />
            <Typography sx={{ textTransform: "capitalize" }}>
              {[dia, horario].filter(Boolean).join(" · ")}
            </Typography>
          </Stack>
        )}

        {atividade.local && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <PlaceIcon fontSize="small" />
            <Typography>{atividade.local}</Typography>
          </Stack>
        )}

        {atividade.descricao && (
          <Typography sx={{ whiteSpace: "pre-line" }}>
            {atividade.descricao}
          </Typography>
        )}

        {atividade.ministrantes && atividade.ministrantes.length > 0 && (
          <>
            <Divider textAlign="left">
              <Typography variant="overline">Ministrantes</Typography>
            </Divider>
            <Stack spacing={1.5}>
              {atividade.ministrantes.map((m) => (
                <Stack key={m.id} spacing={0.25}>
                  <Typography sx={{ fontWeight: 600 }}>{m.nome}</Typography>
                  {(m.areaAtuacao || m.instituicao) && (
                    <Typography variant="body2" color="text.secondary">
                      {[m.areaAtuacao, m.instituicao]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  )}
                  {m.bio && (
                    <Typography variant="body2" color="text.secondary">
                      {m.bio}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
}
