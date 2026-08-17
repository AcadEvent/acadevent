/**
 * ROTA: /gerenciar/[slug]/submissoes
 * OWNER: Arthur   RF: RF06.2, RF06.5, RF06.7, RF03.2.4   PRIORIDADE: MVP
 * PROPÓSITO: Gerenciar submissões, atribuir pareceristas e regras de submissão.
 * COMPONENTES: Table, Dialog
 * DADOS: getSubmissoes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Submissões"}
      owner={"Arthur"}
      rf={"RF06.2, RF06.5, RF06.7, RF03.2.4"}
      priority={"MVP"}
      summary={"Gerenciar submissões, atribuir pareceristas e regras de submissão."}
    />
  );
}
