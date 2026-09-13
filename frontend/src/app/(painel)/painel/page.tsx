/**
 * ROTA: /painel
 * OWNER: Kauan   RF: RF03.1.1, RF03.1.5   PRIORIDADE: MVP
 * PROPÓSITO: Hub pessoal multi-evento: meus eventos, atalhos e notificações.
 * COMPONENTES: PageHeader, Grid, EventCard, List
 * DADOS: getMeusEventos() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   placeholder substituído. Loading em loading.tsx; erro no boundary raiz.
 *   Ver docs/atribuicoes.md.
 */
import type { Metadata } from "next";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExploreIcon from "@mui/icons-material/Explore";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getMeusEventos } from "@/lib/api";
import type { Evento, StatusEvento } from "@/lib/types";

export const metadata: Metadata = {
  title: "Meu painel",
};

const STATUS_EVENTO: Record<
  StatusEvento,
  { label: string; color: "default" | "info" | "success" }
> = {
  rascunho: { label: "Rascunho", color: "default" },
  publicado: { label: "Publicado", color: "info" },
  em_andamento: { label: "Em andamento", color: "success" },
  encerrado: { label: "Encerrado", color: "default" },
  arquivado: { label: "Arquivado", color: "default" },
};

const ATALHOS = [
  {
    label: "Explorar eventos",
    description: "Encontre novas atividades acadêmicas.",
    href: "/eventos",
    icon: <ExploreIcon />,
  },
  {
    label: "Meu perfil",
    description: "Consulte seus dados de conta.",
    href: "/painel/perfil",
    icon: <PersonIcon />,
  },
  {
    label: "Notificações",
    description: "Acompanhe alterações nos seus eventos.",
    href: "/painel/notificacoes",
    icon: <NotificationsNoneIcon />,
  },
];

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatPeriodo(inicio: string, fim: string): string {
  return `${FORMATADOR_DATA.format(new Date(inicio))} – ${FORMATADOR_DATA.format(
    new Date(fim),
  )}`;
}

function MeuEventoCard({ evento }: { evento: Evento }) {
  const status = STATUS_EVENTO[evento.status];

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
        >
          <Chip size="small" label={status.label} color={status.color} />
          {evento.sigla && (
            <Typography variant="caption" color="text.secondary">
              {evento.sigla} {evento.edicao}
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" component="h3" gutterBottom>
          {evento.nome}
        </Typography>

        <Stack spacing={1} sx={{ mt: 2, color: "text.secondary" }}>
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

      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 0,
          flexWrap: "wrap",
          gap: 1,
          "& > :not(style) ~ :not(style)": { ml: 0 },
        }}
      >
        <Button href={`/painel/eventos/${evento.slug}`} variant="contained">
          Acessar evento
        </Button>
        <Button href={`/eventos/${evento.slug}`} variant="text">
          Página pública
        </Button>
      </CardActions>
    </Card>
  );
}

export default async function PainelPage() {
  const eventos = await getMeusEventos();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <PageHeader
        title="Meu painel"
        subtitle="Acompanhe seus eventos e acesse rapidamente as próximas atividades."
        actions={
          <Button href="/eventos" variant="outlined" startIcon={<ExploreIcon />}>
            Explorar eventos
          </Button>
        }
      />

      <Box component="section" aria-labelledby="meus-eventos-title" sx={{ mb: 5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 2 }}
        >
          <EventAvailableIcon color="primary" />
          <Typography id="meus-eventos-title" variant="h5" component="h2">
            Meus eventos
          </Typography>
        </Stack>

        {eventos.length === 0 ? (
          <Paper variant="outlined">
            <EmptyState
              title="Você ainda não participa de nenhum evento"
              description="Explore os eventos publicados e faça sua primeira inscrição."
              icon={<EventAvailableIcon sx={{ fontSize: 48 }} />}
              action={
                <Button href="/eventos" variant="contained">
                  Encontrar eventos
                </Button>
              }
            />
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {eventos.map((evento) => (
              <Grid key={evento.slug} size={{ xs: 12, lg: 6 }}>
                <MeuEventoCard evento={evento} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box component="section" aria-labelledby="atalhos-title">
            <Typography id="atalhos-title" variant="h5" component="h2" sx={{ mb: 2 }}>
              Atalhos rápidos
            </Typography>
            <Grid container spacing={2}>
              {ATALHOS.map((atalho) => (
                <Grid key={atalho.href} size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ height: "100%", p: 2 }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Box sx={{ color: "primary.main", display: "inline-flex" }}>
                        {atalho.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="h3">
                          {atalho.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {atalho.description}
                        </Typography>
                      </Box>
                      <Button href={atalho.href} size="small" sx={{ alignSelf: "flex-start" }}>
                        Acessar
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box component="section" aria-labelledby="notificacoes-title">
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
            >
              <Typography id="notificacoes-title" variant="h5" component="h2">
                Notificações
              </Typography>
              <Button href="/painel/notificacoes" size="small">
                Ver todas
              </Button>
            </Stack>
            <Paper variant="outlined">
              <EmptyState
                title="Tudo em dia"
                description="Você não tem novas notificações."
                icon={<NotificationsNoneIcon sx={{ fontSize: 48 }} />}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
