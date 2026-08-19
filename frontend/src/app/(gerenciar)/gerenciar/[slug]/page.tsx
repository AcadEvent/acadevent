/**
 * ROTA: /gerenciar/[slug]
 * OWNER: Arthur   RF: RF03.2.1   PRIORIDADE: MVP
 * PROPÓSITO: Dashboard do organizador com indicadores do evento.
 * COMPONENTES: Grid, Card(KPI)
 * DADOS: getDashboard(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Dashboard do organizador"}
      owner={"Arthur"}
      rf={"RF03.2.1"}
      priority={"MVP"}
      summary={"Dashboard do organizador com indicadores do evento."}
    />
  );
}
