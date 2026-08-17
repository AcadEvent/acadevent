/**
 * ROTA: /painel/eventos/[slug]
 * OWNER: Kauan   RF: RF03.1.1   PRIORIDADE: MVP
 * PROPÓSITO: Painel pessoal do evento (visão geral das minhas ações).
 * COMPONENTES: PageHeader, Grid, Card
 * DADOS: getPainelEvento(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Painel do evento"}
      owner={"Kauan"}
      rf={"RF03.1.1"}
      priority={"MVP"}
      summary={"Painel pessoal do evento (visão geral das minhas ações)."}
    />
  );
}
