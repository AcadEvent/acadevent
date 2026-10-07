import { redirect } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import { getSession } from "@/lib/auth/session";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";

/**
 * Shell da gestão do evento. Exige apenas sessão válida: qualquer usuário
 * autenticado pode listar "seus eventos" e criar um novo (POST /eventos só pede
 * login e promove o criador a organizador). O gate por PERFIL de gestão fica em
 * /gerenciar/[slug] — gerir um evento específico exige organizador/comissão/admin
 * (issue #41). A posse do evento continua validada no backend.
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

  return (
    <DashboardShell sidebarTitle="Gestão do evento" items={items}>
      {children}
    </DashboardShell>
  );
}
