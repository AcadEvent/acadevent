import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ConstructionIcon from "@mui/icons-material/Construction";

export interface PagePlaceholderProps {
  /** Título humano da página. */
  title: string;
  /** Responsável pela página (ver docs/atribuicoes.md). */
  owner?: string;
  /** Requisito(s) funcional(is) atendido(s). */
  rf?: string;
  /** Prioridade: MVP ou Pós-MVP. */
  priority?: "MVP" | "Pós-MVP";
  /** Descrição curta do que a página deve fazer (do brief no topo do arquivo). */
  summary?: string;
}

/**
 * Placeholder padrão renderizado por todo stub de rota ainda não implementado.
 * Faz o esqueleto parecer coerente no app rodando e mostra, para quem abre a
 * página, qual é o brief e quem é o dono. Substituir pelo conteúdo real ao
 * implementar (ver o comentário de brief no topo do arquivo da rota).
 */
export default function PagePlaceholder({
  title,
  owner,
  rf,
  priority,
  summary,
}: PagePlaceholderProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderStyle: "dashed",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            p: 1.5,
            borderRadius: "50%",
            bgcolor: "action.hover",
            color: "primary.main",
            mb: 2,
          }}
        >
          <ConstructionIcon fontSize="large" />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>

        {summary ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {summary}
          </Typography>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Página ainda não implementada. Veja o brief no topo do arquivo.
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "center", flexWrap: "wrap" }}
        >
          {owner && <Chip size="small" label={`Responsável: ${owner}`} />}
          {rf && <Chip size="small" variant="outlined" label={rf} />}
          {priority && (
            <Chip
              size="small"
              color={priority === "MVP" ? "primary" : "default"}
              label={priority}
            />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
