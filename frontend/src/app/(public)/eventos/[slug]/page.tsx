/**
 * ROTA: /eventos/[slug]
 * OWNER: Guilherme   RF: RF01.5.1–4   PRIORIDADE: MVP
 * PROPÓSITO: Página pública do evento: dados cadastrais, status de inscrição, botão de inscrever e navegação para cronograma/atividades/ministrantes/patrocinadores.
 * COMPONENTES: Container, PageHeader, Chip(status), Button(inscrever), Tabs/links, EventCard
 * DADOS: getEvento(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import type { ReactNode } from "react";
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupsIcon from "@mui/icons-material/Groups";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PlaceIcon from "@mui/icons-material/Place";

import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/layout/Section";
import { getEvento } from "@/lib/api";
import type { Evento, StatusInscricao } from "@/lib/types";

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

const CTA_LABEL: Record<StatusInscricao, string> = {
  abertas: "Inscrever-se",
  encerradas: "Inscrições encerradas",
  esgotadas: "Vagas esgotadas",
  em_breve: "Inscrições em breve",
};

/** Seções internas navegáveis do evento (RF01.5.2). */
const NAV_ITEMS: {
  segmento: string;
  titulo: string;
  descricao: string;
  icon: ReactNode;
}[] = [
  {
    segmento: "cronograma",
    titulo: "Cronograma",
    descricao: "Programação completa por dia e horário.",
    icon: <CalendarMonthIcon fontSize="large" />,
  },
  {
    segmento: "atividades",
    titulo: "Atividades",
    descricao: "Palestras, minicursos, workshops e mais.",
    icon: <EventNoteIcon fontSize="large" />,
  },
  {
    segmento: "ministrantes",
    titulo: "Ministrantes",
    descricao: "Quem conduz as atividades do evento.",
    icon: <GroupsIcon fontSize="large" />,
  },
  {
    segmento: "patrocinadores",
    titulo: "Patrocinadores",
    descricao: "Instituições e empresas que apoiam o evento.",
    icon: <HandshakeIcon fontSize="large" />,
  },
  {
    segmento: "anais",
    titulo: "Anais",
    descricao: "Trabalhos aceitos e publicações do evento.",
    icon: <MenuBookIcon fontSize="large" />,
  },
  {
    segmento: "galeria",
    titulo: "Galeria",
    descricao: "Fotos e registros das edições.",
    icon: <PhotoLibraryIcon fontSize="large" />,
  },
];

const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dataCurtaFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
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
    return {
      title: `${evento.nome}${evento.sigla ? ` (${evento.sigla})` : ""}`,
      description: evento.descricao,
    };
  } catch {
    return { title: "Evento" };
  }
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  try {
    evento = await getEvento(slug);
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar este evento. Tente novamente mais tarde.
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

  const inscricaoAberta = evento.inscricao === "abertas";
  const infos: { icon: ReactNode; label: string; valor: string }[] = [
    {
      icon: <CalendarMonthIcon fontSize="small" />,
      label: "Período",
      valor: formatPeriodo(evento.inicio, evento.fim),
    },
    ...(evento.local
      ? [
          {
            icon: <PlaceIcon fontSize="small" />,
            label: "Local",
            valor: evento.local,
          },
        ]
      : []),
    ...(evento.instituicao
      ? [
          {
            icon: <AccountBalanceIcon fontSize="small" />,
            label: "Instituição",
            valor: evento.instituicao,
          },
        ]
      : []),
    ...(evento.areaTematica
      ? [
          {
            icon: <CategoryIcon fontSize="small" />,
            label: "Área temática",
            valor: evento.areaTematica,
          },
        ]
      : []),
    ...(evento.capacidade
      ? [
          {
            icon: <PeopleIcon fontSize="small" />,
            label: "Capacidade",
            valor: `${evento.capacidade} participantes`,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Cabeçalho / capa do evento */}
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Chip
              color={INSCRICAO_COLOR[evento.inscricao]}
              label={INSCRICAO_LABEL[evento.inscricao]}
            />

            {evento.sigla && (
              <Typography variant="overline" sx={{ opacity: 0.85 }}>
                {evento.sigla}
                {evento.edicao ? ` · ${evento.edicao}` : ""}
              </Typography>
            )}

            <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
              {evento.nome}
            </Typography>

            {evento.descricao && (
              <Typography
                variant="h6"
                component="p"
                sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 720 }}
              >
                {evento.descricao}
              </Typography>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.5, sm: 3 }}
              sx={{ flexWrap: "wrap", opacity: 0.9 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">
                  {formatPeriodo(evento.inicio, evento.fim)}
                </Typography>
              </Box>
              {evento.local && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PlaceIcon fontSize="small" />
                  <Typography variant="body2">{evento.local}</Typography>
                </Box>
              )}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 1, width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                href={inscricaoAberta ? `/eventos/${evento.slug}/inscricao` : undefined}
                disabled={!inscricaoAberta}
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<HowToRegIcon />}
              >
                {CTA_LABEL[evento.inscricao]}
              </Button>
              <Button
                href={`/eventos/${evento.slug}/cronograma`}
                variant="outlined"
                color="inherit"
                size="large"
              >
                Ver cronograma
              </Button>
            </Stack>

            {evento.inscricao === "em_breve" && evento.aberturaInscricoes && (
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Inscrições abrem em{" "}
                {dataCurtaFmt.format(new Date(evento.aberturaInscricoes))}.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Material de divulgação — banner (RF01.5.4) */}
      {evento.bannerUrl && (
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
          <Box
            component="img"
            src={evento.bannerUrl}
            alt={`Banner do evento ${evento.nome}`}
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 1,
              display: "block",
            }}
          />
        </Container>
      )}

      {/* Explore o evento — navegação para as seções (RF01.5.2) */}
      <Section
        title="Explore o evento"
        subtitle="Programação, atividades e quem faz parte."
      >
        <Grid container spacing={3}>
          {NAV_ITEMS.map((item) => (
            <Grid key={item.segmento} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  href={`/eventos/${evento.slug}/${item.segmento}`}
                  sx={{ height: "100%", alignItems: "flex-start" }}
                >
                  <CardContent sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", mb: 1 }}
                    >
                      <Box sx={{ color: "primary.main", display: "inline-flex" }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                        {item.titulo}
                      </Typography>
                      <ArrowForwardIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.descricao}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Informações do evento (RF01.5.2) */}
      <Section title="Informações" bgcolor="background.paper">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Typography variant="h6" component="h3">
                Sobre o evento
              </Typography>
              <Typography color="text.secondary">
                {evento.descricao ??
                  "As informações detalhadas deste evento serão divulgadas em breve."}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2} divider={<Divider flexItem />}>
                  {infos.map((info) => (
                    <Box
                      key={info.label}
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                    >
                      <Box sx={{ color: "primary.main", display: "inline-flex" }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {info.label}
                        </Typography>
                        <Typography variant="body2">{info.valor}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Button
                  href={inscricaoAberta ? `/eventos/${evento.slug}/inscricao` : undefined}
                  disabled={!inscricaoAberta}
                  variant="contained"
                  fullWidth
                  startIcon={<HowToRegIcon />}
                  sx={{ mt: 3 }}
                >
                  {CTA_LABEL[evento.inscricao]}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Section>
    </>
  );
}
