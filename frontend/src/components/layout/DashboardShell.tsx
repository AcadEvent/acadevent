import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import SchoolIcon from "@mui/icons-material/School";
import Sidebar, { type SidebarItem } from "./Sidebar";

export interface DashboardShellProps {
  sidebarTitle: string;
  items: SidebarItem[];
  children: React.ReactNode;
}

/**
 * Shell das áreas autenticadas (painel, gerenciar, admin): barra superior fina +
 * navegação lateral + conteúdo. A navegação escopada por evento ([slug]) é
 * acrescentada dentro das próprias páginas de evento (TODO dos donos).
 */
export default function DashboardShell({
  sidebarTitle,
  items,
  children,
}: DashboardShellProps) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1 }}>
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
          <Box sx={{ flexGrow: 1 }} />
          {/* TODO(auth): avatar/menu do usuário autenticado. */}
          <Button href="/painel" color="inherit" size="small">
            Meu painel
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }}>
        <Sidebar title={sidebarTitle} items={items} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
