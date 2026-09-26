/**
 * ROTA: /eventos
 * OWNER: Guilherme   RF: RF01.5.1   PRIORIDADE: MVP
 * PROPÓSITO: listagem de eventos publicados, com busca por texto.
 * COMPONENTES: Container, PageHeader, Grid, EventCard, TextField(busca),
 *   EmptyState. (Filtros avançados/paginação: EventFilters — briefado.)
 * DADOS: getEventosPublicados() de src/lib/api.
 * ESTADOS: vazio(EmptyState). loading/erro cobertos por loading.tsx/error.tsx.
 * DONE: responsivo, tokens do tema, sem cor hardcoded.
 *
 * Página de referência (real) — segunda amostra do padrão, agora de listagem.
 */
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import PageHeader from "@/components/layout/PageHeader";
import EventCard from "@/components/domain/EventCard";
import EmptyState from "@/components/ui/EmptyState";
import { getEventosPublicados } from "@/lib/api";
import type { Evento } from "@/lib/types";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const termo = (q ?? "").trim().toLowerCase();

  let todos: Evento[] = [];
  let erro = false;
  try {
    todos = await getEventosPublicados();
  } catch {
    erro = true;
  }
  const eventos = termo
    ? todos.filter((e) =>
        [e.nome, e.sigla, e.areaTematica, e.instituicao]
          .filter(Boolean)
          .some((campo) => campo!.toLowerCase().includes(termo)),
      )
    : todos;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Eventos"
        subtitle="Encontre eventos acadêmicos publicados."
      />

      <Box component="form" action="/eventos" sx={{ mb: 4, maxWidth: 480 }}>
        <TextField
          name="q"
          defaultValue={q ?? ""}
          fullWidth
          placeholder="Buscar por nome, sigla, área…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {erro ? (
        <Alert severity="error">
          <AlertTitle>Não foi possível carregar os eventos</AlertTitle>
          Tente novamente em instantes.
        </Alert>
      ) : eventos.length === 0 ? (
        <EmptyState
          title="Nenhum evento encontrado"
          description={
            termo
              ? `Nada corresponde a “${q}”. Tente outro termo.`
              : "Ainda não há eventos publicados."
          }
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
    </Container>
  );
}
