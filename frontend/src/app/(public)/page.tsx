/**
 * ROTA: /  (Landing / descoberta)
 * OWNER: Guilherme   RF: acesso público / RF01.5.1   PRIORIDADE: MVP
 * PROPÓSITO: vitrine de eventos públicos + busca + chamada para ação.
 *
 * Esta página é o EXEMPLO DE REFERÊNCIA do projeto: 100% MUI, sem cor
 * hardcoded, responsiva, usa componentes de layout/domínio compartilhados e
 * consome dados via src/lib/api. Imite o padrão daqui nas demais páginas.
 */
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import Section from "@/components/layout/Section";
import EventCard from "@/components/domain/EventCard";
import EmptyState from "@/components/ui/EmptyState";
import { getEventosPublicados } from "@/lib/api";

const COMO_FUNCIONA = [
  {
    icon: <ExploreIcon fontSize="large" />,
    titulo: "Descubra",
    texto: "Explore eventos acadêmicos publicados, com cronograma e atividades.",
  },
  {
    icon: <HowToRegIcon fontSize="large" />,
    titulo: "Inscreva-se",
    texto: "Faça sua inscrição em poucos passos e monte sua grade de atividades.",
  },
  {
    icon: <WorkspacePremiumIcon fontSize="large" />,
    titulo: "Certifique-se",
    texto: "Acompanhe sua presença e baixe seus certificados ao fim do evento.",
  },
];

export default async function LandingPage() {
  const eventos = await getEventosPublicados();

  return (
    <>
      {/* Hero */}
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
            Eventos acadêmicos, do cadastro à certificação.
          </Typography>
          <Typography variant="h6" component="p" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
            Descubra congressos, simpósios e semanas acadêmicas. Inscreva-se,
            participe e receba seus certificados — tudo em um só lugar.
          </Typography>

          <Paper
            component="form"
            action="/eventos"
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: 520,
              mx: "auto",
              px: 2,
              py: 0.5,
              borderRadius: 999,
            }}
          >
            <SearchIcon color="action" />
            <InputBase
              name="q"
              placeholder="Buscar eventos…"
              sx={{ ml: 1, flex: 1 }}
              inputProps={{ "aria-label": "Buscar eventos" }}
            />
            <Button type="submit" variant="contained" sx={{ borderRadius: 999 }}>
              Buscar
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Eventos em destaque */}
      <Section
        title="Eventos em destaque"
        subtitle="Confira os eventos com inscrições abertas ou em breve."
      >
        {eventos.length === 0 ? (
          <EmptyState
            title="Nenhum evento publicado ainda"
            description="Assim que houver eventos publicados, eles aparecerão aqui."
          />
        ) : (
          <Grid container spacing={3}>
            {eventos.map((evento) => (
              <Grid key={evento.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <EventCard evento={evento} />
              </Grid>
            ))}
          </Grid>
        )}

        <Stack sx={{ alignItems: "center", mt: 5 }}>
          <Button href="/eventos" variant="outlined" size="large">
            Ver todos os eventos
          </Button>
        </Stack>
      </Section>

      {/* Como funciona */}
      <Section title="Como funciona" bgcolor="background.paper">
        <Grid container spacing={4}>
          {COMO_FUNCIONA.map((item) => (
            <Grid key={item.titulo} size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
                <Typography variant="h6" component="h3">
                  {item.titulo}
                </Typography>
                <Typography color="text.secondary">{item.texto}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* CTA organizadores */}
      <Section maxWidth="md">
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Organiza um evento?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Publique seu evento, gerencie inscrições, atividades e emita
            certificados automaticamente.
          </Typography>
          <Button href="/gerenciar/eventos/novo" variant="contained" size="large">
            Criar meu evento
          </Button>
        </Paper>
      </Section>
    </>
  );
}
