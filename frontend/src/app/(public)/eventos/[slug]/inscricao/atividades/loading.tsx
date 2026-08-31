import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

/**
 * Loading do passo 2 da inscrição. O app/loading.tsx global é só um spinner —
 * aqui o esqueleto espelha o layout real (cabeçalho, stepper, lista de
 * atividades e resumo), como pede o comentário do loading.tsx da raiz.
 */
export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Skeleton variant="text" width={220} height={52} />
      <Skeleton variant="text" width={360} />
      <Skeleton variant="rounded" height={72} sx={{ my: { xs: 3, md: 5 } }} />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={120} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
      </Grid>
    </Container>
  );
}
