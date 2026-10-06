import { redirect } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";
import { getSession, hasRole } from "@/lib/auth/session";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventNoteIcon from "@mui/icons-material/EventNote";

/**
 * Shell do painel do usuário (participante/ministrante/patrocinador). Exige
 * apenas sessão válida — qualquer usuário autenticado entra. O middleware faz o
 * gate barato; aqui resolvemos a sessão de fato e redirecionamos ao login se o
 * token estiver ausente/expirado (issue #41).
 */
const itemsBase = [
  { label: "Início", href: "/painel", icon: <DashboardIcon /> },
  { label: "Perfil", href: "/painel/perfil", icon: <PersonIcon /> },
  { label: "Notificações", href: "/painel/notificacoes", icon: <NotificationsIcon /> },
];

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Porta de entrada para a gestão: só aparece para quem pode gerenciar.
  const items = hasRole(session, ["organizador", "comissao", "admin"])
    ? [
        ...itemsBase,
        {
          label: "Gerenciar eventos",
          href: "/gerenciar/eventos",
          icon: <EventNoteIcon />,
        },
      ]
    : itemsBase;

  return (
    <DashboardShell sidebarTitle="Meu painel" items={items}>
      {children}
    </DashboardShell>
  );
}
