import { redirect } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import AcessoNegado from "@/components/layout/AcessoNegado";
import { getSession, hasRole } from "@/lib/auth/session";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";

/**
 * Shell da gestão do evento. O middleware (src/middleware.ts) garante sessão;
 * aqui exigimos um perfil de gestão (organizador/comissão/admin — RBAC, issue
 * #41). A posse do evento específico continua sendo validada no backend. Dentro
 * de /gerenciar/[slug] o dono acrescenta a navegação das seções.
 */
const items = [
  { label: "Meus eventos", href: "/gerenciar/eventos", icon: <EventIcon /> },
  { label: "Novo evento", href: "/gerenciar/eventos/novo", icon: <AddIcon /> },
];

export default async function GerenciarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session, ["organizador", "comissao", "admin"])) {
    return <AcessoNegado area="gestão de eventos" />;
  }

  return (
    <DashboardShell sidebarTitle="Gestão do evento" items={items}>
      {children}
    </DashboardShell>
  );
}
