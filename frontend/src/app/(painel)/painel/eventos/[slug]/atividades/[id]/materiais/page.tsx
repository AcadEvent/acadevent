/**
 * ROTA: /painel/eventos/[slug]/atividades/[id]/materiais
 * OWNER: Kauan   RF: RF10.3   PRIORIDADE: MVP
 * PROPÓSITO: Materiais das atividades em que estou inscrito.
 * COMPONENTES: List, Link(download)
 * DADOS: getMateriaisAtividade(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Materiais da atividade"}
      owner={"Kauan"}
      rf={"RF10.3"}
      priority={"MVP"}
      summary={"Materiais das atividades em que estou inscrito."}
    />
  );
}
