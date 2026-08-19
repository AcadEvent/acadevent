import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/** 404 — rota inexistente ou evento não publicado. */
export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="h1" component="p" color="primary.main" sx={{ fontWeight: 800 }}>
            404
          </Typography>
          <Typography variant="h5" component="h1">
            Página não encontrada
          </Typography>
          <Typography color="text.secondary">
            A página que você procura não existe ou o evento ainda não foi publicado.
          </Typography>
          <Button href="/" variant="contained">
            Voltar ao início
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
