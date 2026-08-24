/**
 * ROTA: /eventos/[slug]/inscricao
 * OWNER: Igor   RF: RF01.5.3, RNF04.4   PRIORIDADE: MVP
 * PROPÓSITO: Passo 1 do fluxo de inscrição em rota única (Stepper, ≤5 passos):
 *   confirma os dados do participante e encaminha para a seleção de atividades.
 *   Requer autenticação (sessão checada na página).
 * COMPONENTES: Container, PageHeader, Stepper, Card, Chip, InscricaoForm (local)
 * DADOS: getEvento(slug), getLotes(slug) (via src/lib/api — nunca fetch direto)
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
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PlaceIcon from "@mui/icons-material/Place";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getEvento, getLotes } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { Evento, LoteIngresso, StatusInscricao } from "@/lib/types";

import InscricaoForm from "./InscricaoForm";

/**
 * Guarda de sessão desta página (RF02.1.2). Segue a mesma convenção do
 * src/proxy.ts: enquanto o contrato de auth com o backend não existe,
 * `getSession()` sempre devolve null — então o gate fica DESLIGADO para o time
 * conseguir percorrer o fluxo com os dados mock.
 *
 * TODO(auth): ligar junto com o AUTH_ENABLED do src/proxy.ts.
 */
const AUTH_ENABLED = false;

/** Passos do wizard de inscrição — 4 de no máximo 5 (RNF04.4). */
const PASSOS = ["Dados", "Atividades", "Pagamento", "Confirmação"];

const INSCRICAO_LABEL: Record<StatusInscricao, string> = {
  abertas: "Inscrições abertas",
  encerradas: "Inscrições encerradas",
  esgotadas: "Esgotado",
  em_breve: "Inscrições em breve",
};

const INSCRICAO_COLOR: Record<
  StatusInscricao,
  "success" | "default" | "error" | "info"
> = {
  abertas: "success",
  encerradas: "default",
  esgotadas: "error",
  em_breve: "info",
};

/** Motivo do bloqueio quando as inscrições não estão abertas (RF01.5.3). */
const BLOQUEIO: Record<
  Exclude<StatusInscricao, "abertas">,
  { titulo: string; texto: string; severidade: "info" | "warning" | "error" }
> = {
  em_breve: {
    titulo: "Inscrições ainda não abriram",
    texto:
      "As inscrições deste evento serão liberadas em breve. Acompanhe a página do evento para ser avisado.",
    severidade: "info",
  },
  encerradas: {
    titulo: "Inscrições encerradas",
    texto: "O período de inscrições deste evento já terminou.",
    severidade: "warning",
  },
  esgotadas: {
    titulo: "Vagas esgotadas",
    texto:
      "Todas as vagas deste evento foram preenchidas. Não é possível concluir a inscrição.",
    severidade: "error",
  },
};

const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dataCurtaFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const moedaFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatPeriodo(inicio: string, fim: string): string {
  return `${dataFmt.format(new Date(inicio))} – ${dataFmt.format(new Date(fim))}`;
}

function vagasDe(lote: LoteIngresso): number {
  return lote.vagasRestantes ?? lote.vagas;
}

function loteAberto(lote: LoteIngresso, agora: Date): boolean {
  const abre = lote.abertura ? new Date(lote.abertura) : null;
  const fecha = lote.encerramento ? new Date(lote.encerramento) : null;
  return (!abre || abre <= agora) && (!fecha || fecha >= agora);
}

/**
 * Lote que vale para quem se inscreve agora: o primeiro aberto e com vaga. Sem
 * nenhum aberto, devolve o próximo a abrir (para informar a data). A escolha do
 * lote em si é do passo de pagamento — aqui ele é só resumo (RF04.2).
 */
function loteVigente(lotes: LoteIngresso[], agora: Date): LoteIngresso | null {
  const aberto = lotes.find((l) => loteAberto(l, agora) && vagasDe(l) > 0);
  if (aberto) return aberto;

  const futuros = lotes
    .filter((l) => l.abertura && new Date(l.abertura) > agora)
    .sort((a, b) => (a.abertura ?? "").localeCompare(b.abertura ?? ""));
  return futuros[0] ?? null;
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
    return { title: `Inscrição — ${evento.nome}` };
  } catch {
    return { title: "Inscrição" };
  }
}

export default async function InscricaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let lotes: LoteIngresso[];
  try {
    [evento, lotes] = await Promise.all([getEvento(slug), getLotes(slug)]);
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar os dados da inscrição. Tente novamente mais
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
              href={`/login?redirect=/eventos/${slug}/inscricao`}
            >
              Entrar
            </Button>
          }
        >
          <AlertTitle>Entre para se inscrever</AlertTitle>
          É preciso estar autenticado para se inscrever em {evento.nome}.
        </Alert>
      </Container>
    );
  }

  const agora = new Date();
  const lote = loteVigente(lotes, agora);
  const loteDisponivel = lote
    ? loteAberto(lote, agora) && vagasDe(lote) > 0
    : false;
  const bloqueio =
    evento.inscricao === "abertas" ? null : BLOQUEIO[evento.inscricao];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Inscrição"
        subtitle={`${evento.nome}${evento.edicao ? ` · ${evento.edicao}` : ""}`}
        actions={
          <Button href={`/eventos/${evento.slug}`} variant="text">
            Voltar ao evento
          </Button>
        }
      />

      <Stepper
        activeStep={0}
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
        {/* Passo 1 — dados do participante */}
        <Grid size={{ xs: 12, md: 7 }}>
          <InscricaoForm
            eventoSlug={evento.slug}
            bloqueado={Boolean(bloqueio)}
            nomePadrao={sessao?.nome ?? ""}
          />
        </Grid>

        {/* Resumo do evento e do ingresso (somente leitura) */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <Chip
                  size="small"
                  color={INSCRICAO_COLOR[evento.inscricao]}
                  label={INSCRICAO_LABEL[evento.inscricao]}
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
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                    color: "text.secondary",
                  }}
                >
                  <ConfirmationNumberIcon fontSize="small" />
                  <Typography variant="overline">Ingresso</Typography>
                </Box>

                {!lote ? (
                  <Typography variant="body2" color="text.secondary">
                    {lotes.length === 0
                      ? "Nenhum lote de ingressos cadastrado para este evento."
                      : "Nenhum lote de ingressos disponível no momento."}
                  </Typography>
                ) : (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{lote.nome}</Typography>
                    <Typography variant="h5" component="p" color="primary.main">
                      {lote.preco > 0 ? moedaFmt.format(lote.preco) : "Gratuito"}
                    </Typography>

                    {loteDisponivel ? (
                      <>
                        {lote.encerramento && (
                          <Typography variant="body2" color="text.secondary">
                            Válido até{" "}
                            {dataCurtaFmt.format(new Date(lote.encerramento))}.
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {vagasDe(lote)} vagas restantes.
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {lote.abertura && new Date(lote.abertura) > agora
                          ? `Disponível a partir de ${dataCurtaFmt.format(new Date(lote.abertura))}.`
                          : "Lote indisponível no momento."}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ pt: 1 }}
                    >
                      O lote e o cupom de desconto são confirmados no passo de
                      pagamento.
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
