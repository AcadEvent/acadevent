/**
 * ROTA: /eventos/[slug]/cronograma
 * OWNER: Igor   RF: RF05.2   PRIORIDADE: MVP
 * PROPÓSITO: Cronograma público organizado por dia e por sala/espaço.
 * COMPONENTES: Container, Tabs(por dia), List, Card
 * DADOS: getAtividades(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Cronograma"}
      owner={"Igor"}
      rf={"RF05.2"}
      priority={"MVP"}
      summary={"Cronograma público organizado por dia e por sala/espaço."}
    />
  );
}
