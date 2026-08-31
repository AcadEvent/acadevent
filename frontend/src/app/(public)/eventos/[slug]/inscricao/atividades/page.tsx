/**
 * ROTA: /eventos/[slug]/inscricao/atividades
 * OWNER: Igor   RF: RF05.3, RF05.4   PRIORIDADE: MVP
 * PROPÓSITO: Passo 2 do fluxo de inscrição: seleção de atividades, respeitando a
 *   capacidade de cada uma (RF05.3) e alertando sobre conflitos de horário
 *   (RF05.4). Requer autenticação (sessão checada na página).
 * COMPONENTES: Container, PageHeader, Stepper, Card, Checkbox, Alert(conflito),
 *   AtividadesForm (local)
 * DADOS: getEvento(slug), getAtividades(slug), getMinistrantes(slug)
 *   (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton, em ./loading.tsx) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PlaceIcon from "@mui/icons-material/Place";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getAtividades, getEvento, getMinistrantes } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { Atividade, Evento, Ministrante } from "@/lib/types";

import { AUTH_ENABLED, BLOQUEIO, PASSOS } from "../wizard";
import AtividadesForm from "./AtividadesForm";

const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatPeriodo(inicio: string, fim: string): string {
  return `${dataFmt.format(new Date(inicio))} – ${dataFmt.format(new Date(fim))}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const evento = await getEvento(slug);
    if (!evento) return { title: "Evento não encontrado" };
    return { title: `Atividades — ${evento.nome}` };
  } catch {
    return { title: "Inscrição · Atividades" };
  }
}

export default async function InscricaoAtividadesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let atividades: Atividade[];
  let ministrantes: Ministrante[];
  try {
    [evento, atividades, ministrantes] = await Promise.all([
      getEvento(slug),
      getAtividades(slug),
      getMinistrantes(slug),
    ]);
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar as atividades do evento. Tente novamente mais
          tarde.
        </Alert>
      </Container>
    );
  }

  if (!evento) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <EmptyState
          title="Evento não encontrado"
          description="O evento que você procura não existe ou não está mais publicado."
          action={
            <Button href="/eventos" variant="contained">
              Ver todos os eventos
            </Button>
          }
        />
      </Container>
    );
  }

  const sessao = await getSession();
  if (AUTH_ENABLED && !sessao) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              href={`/login?redirect=/eventos/${slug}/inscricao/atividades`}
            >
              Entrar
            </Button>
          }
        >
          <AlertTitle>Entre para se inscrever</AlertTitle>
          É preciso estar autenticado para escolher as atividades de{" "}
          {evento.nome}.
        </Alert>
      </Container>
    );
  }

  const bloqueio =
    evento.inscricao === "abertas" ? null : BLOQUEIO[evento.inscricao];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Atividades"
        subtitle={`${evento.nome}${evento.edicao ? ` · ${evento.edicao}` : ""}`}
        actions={
          <Button href={`/eventos/${evento.slug}`} variant="text">
            Voltar ao evento
          </Button>
        }
      />

      <Stepper
        activeStep={1}
        alternativeLabel
        sx={{
          mb: { xs: 3, md: 5 },
          "& .MuiStepLabel-label": {
            typography: { xs: "caption", sm: "body2" },
          },
        }}
      >
        {PASSOS.map((passo) => (
          <Step key={passo}>
            <StepLabel>{passo}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {bloqueio && (
        <Alert
          severity={bloqueio.severidade}
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              href={`/eventos/${evento.slug}`}
            >
              Ver evento
            </Button>
          }
        >
          <AlertTitle>{bloqueio.titulo}</AlertTitle>
          {bloqueio.texto}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Passo 2 — seleção de atividades */}
        <Grid size={{ xs: 12, md: 8 }}>
          {atividades.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <EmptyState
                  title="Nenhuma atividade publicada"
                  description="A programação deste evento ainda não foi divulgada. Você pode concluir a inscrição e escolher as atividades depois."
                  icon={<EventNoteIcon sx={{ fontSize: 48 }} />}
                  action={
                    <Button
                      href={`/eventos/${evento.slug}/inscricao/pagamento`}
                      variant="contained"
                      disabled={Boolean(bloqueio)}
                    >
                      Continuar
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <AtividadesForm
              eventoSlug={evento.slug}
              atividades={atividades}
              ministrantes={ministrantes}
              bloqueado={Boolean(bloqueio)}
            />
          )}
        </Grid>

        {/* Resumo do evento (somente leitura) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Chip
                size="small"
                variant="outlined"
                label={`${atividades.length} ${atividades.length === 1 ? "atividade" : "atividades"}`}
                sx={{ mb: 1.5 }}
              />
              <Typography variant="subtitle1" component="h2" gutterBottom>
                {evento.nome}
              </Typography>
              <Stack spacing={1} sx={{ color: "text.secondary" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarMonthIcon fontSize="small" />
                  <Typography variant="body2">
                    {formatPeriodo(evento.inicio, evento.fim)}
                  </Typography>
                </Box>
                {evento.local && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlaceIcon fontSize="small" />
                    <Typography variant="body2">{evento.local}</Typography>
                  </Box>
                )}
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", pt: 2 }}
              >
                Atividades com vagas esgotadas não podem ser selecionadas
                (RF05.3). Horários sobrepostos precisam ser resolvidos antes de
                avançar (RF05.4).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
