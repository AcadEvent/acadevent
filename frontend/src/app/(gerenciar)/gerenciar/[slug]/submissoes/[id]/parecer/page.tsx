/**
 * ROTA: /gerenciar/[slug]/submissoes/[id]/parecer
 * OWNER: Arthur   RF: RF06.3, RF06.4   PRIORIDADE: MVP
 * PROPÓSITO: Avaliação/parecer de um trabalho (aceito/rejeitado/revisão).
 * COMPONENTES: TextField, RadioGroup(parecer), Button
 * DADOS: getSubmissao(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Parecer"}
      owner={"Arthur"}
      rf={"RF06.3, RF06.4"}
      priority={"MVP"}
      summary={"Avaliação/parecer de um trabalho (aceito/rejeitado/revisão)."}
    />
  );
}
