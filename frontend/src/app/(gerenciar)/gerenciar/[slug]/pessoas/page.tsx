/**
 * ROTA: /gerenciar/[slug]/pessoas
 * OWNER: Arthur   RF: RF02.2.1, RF03.2.8   PRIORIDADE: MVP
 * PROPÓSITO: Comissão, grupos de trabalho e funções.
 * COMPONENTES: Table, Dialog
 * DADOS: getPessoas(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Pessoas"}
      owner={"Arthur"}
      rf={"RF02.2.1, RF03.2.8"}
      priority={"MVP"}
      summary={"Comissão, grupos de trabalho e funções."}
    />
  );
}
