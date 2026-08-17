/**
 * ROTA: /eventos/[slug]/atividades
 * OWNER: Igor   RF: RF01.5.2, RF05.1   PRIORIDADE: MVP
 * PROPÓSITO: Lista pública de atividades do evento.
 * COMPONENTES: Container, Grid, Card, EventFilters
 * DADOS: getAtividades(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Atividades"}
      owner={"Igor"}
      rf={"RF01.5.2, RF05.1"}
      priority={"MVP"}
      summary={"Lista pública de atividades do evento."}
    />
  );
}
