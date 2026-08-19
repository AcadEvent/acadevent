/**
 * ROTA: /painel/eventos/[slug]/submissoes/nova
 * OWNER: Kauan   RF: RF06.1, RF06.7   PRIORIDADE: MVP
 * PROPÓSITO: Submeter trabalho: título, resumo, área temática e PDF.
 * COMPONENTES: TextField, Select, upload (react-hook-form + zod)
 * DADOS: postSubmissao() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Nova submissão"}
      owner={"Kauan"}
      rf={"RF06.1, RF06.7"}
      priority={"MVP"}
      summary={"Submeter trabalho: título, resumo, área temática e PDF."}
    />
  );
}
