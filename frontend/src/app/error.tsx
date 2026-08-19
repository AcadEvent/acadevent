"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineRounded";
import { useEffect } from "react";

/**
 * Boundary de erro genérico (RNF04.3): mensagem clara e orientada ao usuário.
 * Deve ser client component. `reset` tenta re-renderizar o segmento.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(observabilidade): reportar ao serviço de logs (RF16).
    console.error(error);
  }, [error]);

  return (
    <Box sx={{ minHeight: "60dvh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 56 }} />
          <Typography variant="h5" component="h1">
            Algo deu errado
          </Typography>
          <Typography color="text.secondary">
            Não foi possível carregar esta página. Tente novamente em instantes.
          </Typography>
          <Button variant="contained" onClick={reset}>
            Tentar novamente
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
