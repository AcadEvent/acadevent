import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const LINKS = [
  { label: "Sobre", href: "/sobre" },
  { label: "Termos", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
];

/** Rodapé institucional das áreas públicas. */
export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", mt: "auto", py: 4 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} AcadEvent — Gestão de Eventos Acadêmicos.
          </Typography>
          <Stack direction="row" spacing={2}>
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                {item.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
