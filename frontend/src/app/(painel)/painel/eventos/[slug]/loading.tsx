import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function Loading() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }} aria-label="Carregando dados do evento">
      {/* Breadcrumbs */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <Skeleton variant="text" width={90} height={24} />
        <Skeleton variant="text" width={12} height={24} />
        <Skeleton variant="text" width={140} height={24} />
      </Stack>

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <Skeleton variant="text" width="70%" height={48} />
          <Skeleton variant="text" width="50%" height={28} />
        </Box>
        <Skeleton variant="rounded" width={150} height={40} />
      </Stack>

      {/* Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={160} height={32} />
        <Skeleton variant="rounded" width={110} height={32} />
      </Stack>

      {/* Description */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
      </Box>

      {/* Minhas atividades */}
      <Box sx={{ mb: 5 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Skeleton variant="text" width={180} height={36} />
          <Skeleton variant="text" width={140} height={32} />
        </Stack>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => (
              <Stack key={i} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Acompanhar */}
      <Box>
        <Skeleton variant="text" width={140} height={36} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={130} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
