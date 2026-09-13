import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function Loading() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }} aria-label="Carregando painel">
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={220} height={48} />
        <Skeleton variant="text" width="min(100%, 520px)" />
      </Stack>

      <Skeleton variant="text" width={180} height={40} sx={{ mb: 2 }} />
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[0, 1].map((item) => (
          <Grid key={item} size={{ xs: 12, lg: 6 }}>
            <Skeleton variant="rounded" height={240} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
      </Grid>
    </Box>
  );
}
