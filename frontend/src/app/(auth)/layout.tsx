import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import SchoolIcon from "@mui/icons-material/School";

/** Shell de autenticação: card centralizado com a marca. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          <Link
            href="/"
            underline="none"
            sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}
          >
            <SchoolIcon />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              AcadEvent
            </Typography>
          </Link>
          <Paper variant="outlined" sx={{ width: "100%", p: { xs: 3, sm: 4 } }}>
            {children}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
