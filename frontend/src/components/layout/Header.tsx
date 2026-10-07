import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import SchoolIcon from "@mui/icons-material/School";

import { getSession } from "@/lib/auth/session";
import MenuUsuario from "./MenuUsuario";

const NAV = [
  { label: "Eventos", href: "/eventos" },
  { label: "Sobre", href: "/sobre" },
];

/**
 * Cabeçalho público. Mostra Entrar/Cadastrar quando não há sessão e, quando há,
 * o indicador de usuário (avatar + nome + Sair) — assim o estado de login fica
 * visível também fora das áreas autenticadas.
 */
export default async function Header() {
  const session = await getSession();
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

          {session ? (
            <MenuUsuario nome={session.nome} />
          ) : (
            <Stack direction="row" spacing={1}>
              <Button href="/login" color="inherit">
                Entrar
              </Button>
              <Button href="/cadastro" variant="contained">
                Cadastrar
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
