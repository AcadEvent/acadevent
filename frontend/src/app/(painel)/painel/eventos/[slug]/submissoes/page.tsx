/**
 * ROTA: /painel/eventos/[slug]/submissoes
 * OWNER: Kauan   RF: RF03.1.7   PRIORIDADE: MVP
 * PROPÓSITO: Minhas submissões e seus status.
 * COMPONENTES: Table, Chip(parecer)
 * DADOS: getMinhasSubmissoes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Minhas submissões"}
      owner={"Kauan"}
      rf={"RF03.1.7"}
      priority={"MVP"}
      summary={"Minhas submissões e seus status."}
    />
  );
}
