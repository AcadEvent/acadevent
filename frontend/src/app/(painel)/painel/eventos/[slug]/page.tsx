/**
 * ROTA: /painel/eventos/[slug]
 * OWNER: Kauan   RF: RF03.1.1, RF02.2   PRIORIDADE: MVP
 * PROPÓSITO: Painel pessoal do evento (visão geral das minhas ações e atalhos).
 * COMPONENTES: Breadcrumbs, PageHeader, Chip, Grid, Card, List, EmptyState
 * DADOS: getPainelEvento(slug) (via src/lib/api, nunca fetch direto)
 * ESTADOS: vazio (EmptyState) / erro (Alert). Loading coberto por loading.tsx.
 * DONE: responsivo, tokens do tema, estados cobertos, placeholder substituído.
 *
 * Navegação escopada por evento. Os atalhos são dinâmicos e filtrados
 * pelos papéis que o usuário exerce no evento (RF02.2, RNF03.2).
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArticleIcon from "@mui/icons-material/Article";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlaceIcon from "@mui/icons-material/Place";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getPainelEvento } from "@/lib/api";
import type {
  AtividadeInscrita,
  PainelEvento,
  PerfilUsuario,
  StatusMinhaInscricao,
} from "@/lib/types";

const ATIVIDADES_NO_RESUMO = 3;
const FUSO_EVENTO = "America/Sao_Paulo";

const INSCRICAO_LABEL: Record<StatusMinhaInscricao, string> = {
  confirmada: "Inscrição confirmada",
  pendente: "Pagamento pendente",
  cancelada: "Inscrição cancelada",
};

const INSCRICAO_COLOR: Record<
  StatusMinhaInscricao,
  "success" | "warning" | "default"
> = {
  confirmada: "success",
  pendente: "warning",
  cancelada: "default",
};

const PAPEL_LABEL: Record<PerfilUsuario, string> = {
  visitante: "Visitante",
  participante: "Participante",
  ministrante: "Ministrante",
  patrocinador: "Patrocinador",
  comissao: "Comissão",
  organizador: "Organizador",
  parecerista: "Parecerista",
  admin: "Administrador",
};

const dataLongaFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: FUSO_EVENTO,
});

const dataCurtaFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: FUSO_EVENTO,
});

const horaFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO_EVENTO,
});

function formatPeriodo(inicio: string, fim: string): string {
  return `${dataLongaFmt.format(new Date(inicio))} – ${dataLongaFmt.format(new Date(fim))}`;
}

function formatQuando(atividade: AtividadeInscrita): string {
  const dia = dataCurtaFmt.format(new Date(atividade.inicio));
  const inicio = horaFmt.format(new Date(atividade.inicio));
  const fim = horaFmt.format(new Date(atividade.fim));
  return `${dia} · ${inicio} – ${fim}`;
}

function pluralizar(quantidade: number, um: string, muitos: string): string {
  return `${quantidade} ${quantidade === 1 ? um : muitos}`;
}

interface Atalho {
  segmento: string;
  titulo: string;
  descricao: string;
  icon: ReactNode;
}

function montarAtalhos(evento: PainelEvento): Atalho[] {
  return [
    {
      segmento: "grade",
      titulo: "Grade de atividades",
      descricao: pluralizar(
        evento.atividades.length,
        "atividade inscrita",
        "atividades inscritas",
      ),
      icon: <EventNoteIcon fontSize="large" />,
    },
    {
      segmento: "inscricoes",
      titulo: "Inscrição e pagamento",
      descricao: INSCRICAO_LABEL[evento.statusInscricao],
      icon: <HowToRegIcon fontSize="large" />,
    },
    {
      segmento: "recibos",
      titulo: "Recibos",
      descricao: pluralizar(
        evento.recibosDisponiveis,
        "recibo disponível",
        "recibos disponíveis",
      ),
      icon: <ReceiptLongIcon fontSize="large" />,
    },
    {
      segmento: "certificados",
      titulo: "Certificados",
      descricao: pluralizar(
        evento.certificadosDisponiveis,
        "certificado disponível",
        "certificados disponíveis",
      ),
      icon: <WorkspacePremiumIcon fontSize="large" />,
    },
    {
      segmento: "submissoes",
      titulo: "Submissões",
      descricao: pluralizar(
        evento.submissoesEnviadas,
        "trabalho enviado",
        "trabalhos enviados",
      ),
      icon: <ArticleIcon fontSize="large" />,
    },
    ...(evento.papeis.includes("ministrante")
      ? [
          {
            segmento: "ministrante",
            titulo: "Área do ministrante",
            descricao: "Frequência, materiais e certificados de ministrante.",
            icon: <SchoolIcon fontSize="large" />,
          },
        ]
      : []),
    ...(evento.papeis.includes("comissao")
      ? [
          {
            segmento: "escala",
            titulo: "Minha escala",
            descricao: "Turnos e carga horária na comissão.",
            icon: <ScheduleIcon fontSize="large" />,
          },
        ]
      : []),
    ...(evento.papeis.includes("patrocinador")
      ? [
          {
            segmento: "patrocinio",
            titulo: "Meu patrocínio",
            descricao: "Dados de visibilidade da sua marca no evento.",
            icon: <HandshakeIcon fontSize="large" />,
          },
        ]
      : []),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const evento = await getPainelEvento(slug);
    if (!evento) return { title: "Evento não encontrado" };
    return {
      title: evento.sigla
        ? `${evento.sigla} ${evento.edicao ?? ""}`.trim()
        : evento.nome,
    };
  } catch {
    return { title: "Painel do evento" };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: PainelEvento | null;
  try {
    evento = await getPainelEvento(slug);
  } catch {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <PageHeader title="Painel do evento" />
        <Alert severity="error">
          Não foi possível carregar este evento agora. Tente novamente em instantes.
        </Alert>
      </Box>
    );
  }

  if (!evento) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/painel" underline="hover" color="inherit">
            Meu painel
          </Link>
          <Typography color="text.primary">Evento não encontrado</Typography>
        </Breadcrumbs>
        <EmptyState
          title="Evento não encontrado"
          description="Este evento não existe ou você não participa dele."
          action={
            <Button href="/painel" variant="contained">
              Voltar ao meu painel
            </Button>
          }
        />
      </Box>
    );
  }

  const atalhos = montarAtalhos(evento);
  const atividadesVisiveis = evento.atividades.slice(0, ATIVIDADES_NO_RESUMO);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/painel" underline="hover" color="inherit">
          Meu painel
        </Link>
        <Typography color="text.primary">
          {evento.sigla ?? evento.nome}
        </Typography>
      </Breadcrumbs>

      <PageHeader
        title={evento.nome}
        subtitle={formatPeriodo(evento.inicio, evento.fim)}
        actions={
          <Button
            href={`/eventos/${evento.slug}`}
            variant="outlined"
            startIcon={<OpenInNewIcon />}
          >
            Página pública
          </Button>
        }
      />

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", mb: 2 }}
      >
        <Chip
          color={INSCRICAO_COLOR[evento.statusInscricao]}
          label={INSCRICAO_LABEL[evento.statusInscricao]}
        />
        {evento.papeis.map((papel) => (
          <Chip key={papel} variant="outlined" label={PAPEL_LABEL[papel]} />
        ))}
      </Stack>

      {evento.local && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
            mb: 2,
          }}
        >
          <PlaceIcon fontSize="small" />
          <Typography variant="body2">{evento.local}</Typography>
        </Box>
      )}

      {evento.descricao && (
        <Typography color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
          {evento.descricao}
        </Typography>
      )}

      {evento.statusInscricao === "pendente" && (
        <Alert
          severity="warning"
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              href={`/painel/eventos/${evento.slug}/inscricoes`}
            >
              Ver inscrição
            </Button>
          }
        >
          Sua inscrição só será confirmada após a quitação do pagamento.
        </Alert>
      )}

      <Box component="section" aria-labelledby="minhas-atividades-title" sx={{ mb: 5 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Typography id="minhas-atividades-title" variant="h6" component="h2">
            Minhas atividades
          </Typography>
          {evento.atividades.length > 0 && (
            <Button href={`/painel/eventos/${evento.slug}/grade`} size="small">
              Ver grade completa
            </Button>
          )}
        </Stack>

        {atividadesVisiveis.length === 0 ? (
          <EmptyState
            title="Você ainda não escolheu atividades"
            description="Monte sua grade escolhendo palestras, minicursos e oficinas deste evento."
            action={
              <Button
                href={`/eventos/${evento.slug}/atividades`}
                variant="contained"
              >
                Ver atividades do evento
              </Button>
            }
          />
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {atividadesVisiveis.map((atividade, indice) => (
                <ListItem
                  key={atividade.id}
                  divider={indice < atividadesVisiveis.length - 1}
                  alignItems="flex-start"
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 40, mt: 0.5, color: "primary.main" }}
                  >
                    <EventNoteIcon fontSize="small" />
                  </ListItemIcon>
                  <Box>
                    <Typography variant="subtitle2" component="p">
                      {atividade.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatQuando(atividade)}
                    </Typography>
                    {atividade.local && (
                      <Typography variant="caption" color="text.secondary">
                        {atividade.local}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Box component="section" aria-labelledby="acompanhar-title">
        <Typography id="acompanhar-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Acompanhar
        </Typography>

        <Grid container spacing={3}>
          {atalhos.map((atalho) => (
            <Grid key={atalho.segmento} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  href={`/painel/eventos/${evento.slug}/${atalho.segmento}`}
                  sx={{ height: "100%", alignItems: "flex-start" }}
                >
                  <CardContent sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", mb: 1 }}
                    >
                      <Box
                        sx={{ color: "primary.main", display: "inline-flex" }}
                      >
                        {atalho.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                        {atalho.titulo}
                      </Typography>
                      <ArrowForwardIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {atalho.descricao}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
