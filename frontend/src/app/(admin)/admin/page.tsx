/**
 * ROTA: /admin
 * OWNER: Igor   RF: RF02.1.2   PRIORIDADE: MVP
 * PROPÓSITO: Dashboard administrativo da plataforma.
 * COMPONENTES: Grid, Card(KPI)
 * DADOS: getAdminDashboard() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Dashboard admin"}
      owner={"Igor"}
      rf={"RF02.1.2"}
      priority={"MVP"}
      summary={"Dashboard administrativo da plataforma."}
    />
  );
}
