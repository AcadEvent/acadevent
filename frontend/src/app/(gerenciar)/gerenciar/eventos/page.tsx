/**
 * ROTA: /gerenciar/eventos
 * OWNER: Arthur   RF: RF01.3.3   PRIORIDADE: MVP
 * PROPÓSITO: Lista de eventos que o usuário organiza.
 * COMPONENTES: Grid, EventCard, Button(novo)
 * DADOS: getEventos() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventIcon from "@mui/icons-material/Event";
import PlaceIcon from "@mui/icons-material/Place";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip, { type ChipProps } from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getEventos } from "@/lib/api";
import type { Evento, StatusEvento } from "@/lib/types";

const STATUS_LABEL: Record<StatusEvento, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  em_andamento: "Em andamento",
  encerrado: "Encerrado",
  arquivado: "Arquivado",
};

const STATUS_COLOR: Record<StatusEvento, ChipProps["color"]> = {
  rascunho: "default",
  publicado: "info",
  em_andamento: "success",
  encerrado: "default",
  arquivado: "warning",
};

function formatPeriodo(inicio: string, fim: string): string {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatador.format(new Date(inicio))} – ${formatador.format(new Date(fim))}`;
}

function EventoGerenciadoCard({
  evento,
}: {
  evento: Evento;
}) {
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Chip
            label={STATUS_LABEL[evento.status]}
            color={STATUS_COLOR[evento.status]}
            size="small"
          />
          {(evento.sigla || evento.edicao) && (
            <Typography variant="caption" color="text.secondary">
              {[evento.sigla, evento.edicao].filter(Boolean).join(" ")}
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {evento.nome}
        </Typography>

        <Stack spacing={1} sx={{ color: "text.secondary" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon fontSize="small" />
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

      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 0,
          gap: 1.5,
          alignItems: "stretch",
          flexDirection: "column",
          "& > :not(style) ~ :not(style)": {
            marginLeft: 0,
          },
        }}
      >
        <Button
          href={`/gerenciar/${evento.slug}`}
          endIcon={<ArrowForwardIcon />}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            whiteSpace: "nowrap",
          }}
        >
          Gerenciar evento
        </Button>
      </CardActions>
    </Card>
  );
}

function EventosSkeleton() {
  return (
    <Grid container spacing={3} aria-label="Carregando eventos">
      {[0, 1, 2].map((item) => (
        <Grid key={item} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Skeleton variant="rounded" width={96} height={24} />
              <Skeleton variant="text" height={32} sx={{ mt: 1.5 }} />
              <Skeleton variant="text" width="72%" />
              <Skeleton variant="text" width="88%" sx={{ mt: 2 }} />
              <Skeleton variant="text" width="64%" />
            </CardContent>
            <CardActions
              sx={{
                px: 2,
                pb: 2,
                pt: 0,
                gap: 1,
                flexDirection: "column",
                alignItems: "stretch",
                "& > :not(style) ~ :not(style)": {
                  marginLeft: 0,
                },
              }}
            >
              <Skeleton variant="rounded" width="100%" height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function EventosOrganizadorPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    getEventos()
      .then((resultado) => {
        if (ativo) {
          setEventos(resultado);
          setErro(false);
        }
      })
      .catch(() => {
        if (ativo) {
          setErro(true);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Container maxWidth="lg" disableGutters>
      <PageHeader
        title="Meus eventos"
        subtitle="Acompanhe e gerencie os eventos que você organiza."
        actions={
          <Button
            href="/gerenciar/eventos/novo"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Novo evento
          </Button>
        }
      />

      {carregando ? (
        <EventosSkeleton />
      ) : erro ? (
        <Alert severity="error">
          <AlertTitle>Não foi possível carregar seus eventos</AlertTitle>
          Tente atualizar a página em alguns instantes.
        </Alert>
      ) : eventos.length === 0 ? (
        <EmptyState
          title="Você ainda não organiza nenhum evento"
          description="Crie seu primeiro evento para configurar a edição, publicar as informações e acompanhar a organização."
          action={
            <Button
              href="/gerenciar/eventos/novo"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Criar primeiro evento
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {eventos.map((evento) => (
            <Grid key={evento.slug} size={{ xs: 12, sm: 6, lg: 4 }}>
              <EventoGerenciadoCard
                evento={evento}
              />
            </Grid>
          ))}
        </Grid>
      )}

    </Container>
  );
}
