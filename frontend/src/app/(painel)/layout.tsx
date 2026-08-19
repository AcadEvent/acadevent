import DashboardShell from "@/components/layout/DashboardShell";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";

/**
 * Shell do painel do usuário (participante/ministrante/patrocinador).
 * Proteção RBAC vem de src/middleware.ts. A navegação por evento
 * (/painel/eventos/[slug]/...) é montada dentro das páginas de evento.
 */
const items = [
  { label: "Início", href: "/painel", icon: <DashboardIcon /> },
  { label: "Perfil", href: "/painel/perfil", icon: <PersonIcon /> },
  { label: "Notificações", href: "/painel/notificacoes", icon: <NotificationsIcon /> },
];

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell sidebarTitle="Meu painel" items={items}>
      {children}
    </DashboardShell>
  );
}
