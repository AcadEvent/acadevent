import DashboardShell from "@/components/layout/DashboardShell";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

/**
 * Shell da administração da plataforma. Proteção RBAC (perfil admin) vem de
 * src/middleware.ts.
 */
const items = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { label: "Usuários", href: "/admin/usuarios", icon: <GroupIcon /> },
  { label: "Eventos", href: "/admin/eventos", icon: <EventIcon /> },
  { label: "Logs", href: "/admin/logs", icon: <ReceiptLongIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell sidebarTitle="Administração" items={items}>
      {children}
    </DashboardShell>
  );
}
