import DashboardShell from "@/components/layout/DashboardShell";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";

/**
 * Shell da gestão do evento (organizador/comissão). Proteção RBAC vem de
 * src/middleware.ts. Dentro de /gerenciar/[slug] o dono acrescenta a navegação
 * das seções (configuracoes, atividades, inscricoes, ...).
 */
const items = [
  { label: "Meus eventos", href: "/gerenciar/eventos", icon: <EventIcon /> },
  { label: "Novo evento", href: "/gerenciar/eventos/novo", icon: <AddIcon /> },
];

export default function GerenciarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell sidebarTitle="Gestão do evento" items={items}>
      {children}
    </DashboardShell>
  );
}
