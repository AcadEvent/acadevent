/**
 * ROTA: /painel/eventos/[slug]/ministrante/atividades/[id]/materiais
 * OWNER: Kauan   RF: RF10.2   PRIORIDADE: MVP
 * PROPÓSITO: Upload de materiais da atividade que conduzo.
 * COMPONENTES: upload, List
 * DADOS: postMaterial(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Upload de materiais"}
      owner={"Kauan"}
      rf={"RF10.2"}
      priority={"MVP"}
      summary={"Upload de materiais da atividade que conduzo."}
    />
  );
}
