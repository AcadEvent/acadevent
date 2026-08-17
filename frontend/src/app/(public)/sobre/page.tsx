/**
 * ROTA: /sobre
 * OWNER: Guilherme   RF: institucional   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Página institucional Sobre o AcadEvent.
 * COMPONENTES: Container, Typography
 * DADOS: estático (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Sobre"}
      owner={"Guilherme"}
      rf={"institucional"}
      priority={"Pós-MVP"}
      summary={"Página institucional Sobre o AcadEvent."}
    />
  );
}
