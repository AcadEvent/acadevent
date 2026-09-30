/**
 * ROTA: /eventos/[slug]/cronograma
 * OWNER: Igor   RF: RF05.2, RF14   PRIORIDADE: MVP
 * PROPÓSITO: Cronograma público organizado por dia (via GET /atividades/cronograma).
 * COMPONENTES: Container, PageHeader, AtividadeCard, EmptyState, Alert
 * DADOS: getEvento(slug) + getCronograma(idEdicao) (via @/lib/api — sem fetch direto)
 * ESTADOS: erro (Alert) / vazio (EmptyState) — dados reais do backend.
 * DONE: responsivo, tokens do tema, sem e-mail de ministrante (privacidade).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AtividadeCard from "@/components/domain/AtividadeCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getCronograma, getEvento } from "@/lib/api";
import { chaveDia, formatDiaLongo } from "@/lib/datas";
import type { Atividade, Evento } from "@/lib/types";

export const metadata: Metadata = { title: "Cronograma" };

interface Dia {
  chave: string;
  label: string;
  atividades: Atividade[];
}

/** Agrupa por dia (UTC) preservando a ordem já ordenada por início. */
function agruparPorDia(atividades: Atividade[]): Dia[] {
  const dias = new Map<string, Dia>();
  for (const atividade of atividades) {
    const chave = chaveDia(atividade.inicio);
    let dia = dias.get(chave);
    if (!dia) {
      dia = {
        chave,
        label: formatDiaLongo(atividade.inicio) || "Sem data definida",
        atividades: [],
      };
      dias.set(chave, dia);
    }
    dia.atividades.push(atividade);
  }
  return [...dias.values()].sort((a, b) => a.chave.localeCompare(b.chave));
}

export default async function CronogramaPage({
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
          Não foi possível carregar o cronograma. Tente novamente mais tarde.
        </Alert>
      </Container>
    );
  }

  const dias = agruparPorDia(atividades);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Cronograma"
        subtitle={evento ? evento.nome : undefined}
      />

      {dias.length === 0 ? (
        <EmptyState
          title="Cronograma em construção"
          description="As atividades deste evento ainda não foram publicadas."
        />
      ) : (
        <Stack spacing={4}>
          {dias.map((dia) => (
            <Stack key={dia.chave} spacing={2}>
              <Divider textAlign="left">
                <Typography
                  variant="overline"
                  sx={{ textTransform: "capitalize" }}
                >
                  {dia.label}
                </Typography>
              </Divider>
              <Grid container spacing={2}>
                {dia.atividades.map((atividade) => (
                  <Grid key={atividade.id} size={{ xs: 12, md: 6 }}>
                    <AtividadeCard
                      atividade={atividade}
                      href={`/eventos/${slug}/atividades/${atividade.id}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>
      )}
    </Container>
  );
}
