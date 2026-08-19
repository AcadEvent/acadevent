import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import SchoolIcon from "@mui/icons-material/School";

const NAV = [
  { label: "Eventos", href: "/eventos" },
  { label: "Sobre", href: "/sobre" },
];

/**
 * Cabeçalho público (área não autenticada). Composto de AppBar + Toolbar.
 * TODO(auth): trocar os botões Entrar/Cadastrar por avatar do usuário quando a
 * sessão existir (src/lib/auth/session.ts).
 */
export default function Header() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
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

          <Stack direction="row" spacing={1} sx={{ ml: 2, display: { xs: "none", sm: "flex" } }}>
            {NAV.map((item) => (
              <Button key={item.href} href={item.href} color="inherit">
                {item.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button href="/login" color="inherit">
              Entrar
            </Button>
            <Button href="/cadastro" variant="contained">
              Cadastrar
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
