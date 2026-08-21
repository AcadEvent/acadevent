import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

/**
 * Loading do passo 1 da inscrição. O app/loading.tsx global é só um spinner —
 * aqui o esqueleto espelha o layout real (cabeçalho, stepper, formulário e
 * resumo), como pede o comentário do loading.tsx da raiz.
 */
export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Skeleton variant="text" width={220} height={52} />
      <Skeleton variant="text" width={360} />
      <Skeleton variant="rounded" height={72} sx={{ my: { xs: 3, md: 5 } }} />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rounded" height={520} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="rounded" height={200} />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
