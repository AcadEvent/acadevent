import { redirect } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import AcessoNegado from "@/components/layout/AcessoNegado";
import { getSession, hasRole } from "@/lib/auth/session";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

/**
 * Shell da administração da plataforma. O middleware (src/middleware.ts) garante
 * sessão; aqui exigimos o perfil de administrador (RBAC, RF02.1.2 / issue #41).
 * A autorização por recurso continua no backend (RolesGuard).
 */
const items = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { label: "Usuários", href: "/admin/usuarios", icon: <GroupIcon /> },
  { label: "Eventos", href: "/admin/eventos", icon: <EventIcon /> },
  { label: "Logs", href: "/admin/logs", icon: <ReceiptLongIcon /> },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session, ["admin"])) {
    return <AcessoNegado area="administração" />;
  }

  return (
    <DashboardShell sidebarTitle="Administração" items={items}>
      {children}
    </DashboardShell>
  );
}
