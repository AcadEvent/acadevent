import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

/**
 * Loading do passo 3 da inscrição: esqueleto do cabeçalho, stepper, formulário
 * de checkout e resumo do pedido.
 */
export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Skeleton variant="text" width={220} height={52} />
      <Skeleton variant="text" width={360} />
      <Skeleton variant="rounded" height={72} sx={{ my: { xs: 3, md: 5 } }} />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={140} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      </Grid>
    </Container>
  );
}
