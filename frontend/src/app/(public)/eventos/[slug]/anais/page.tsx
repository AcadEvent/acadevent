/**
 * ROTA: /eventos/[slug]/anais
 * OWNER: Igor   RF: RF06.6   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Anais: trabalhos aceitos publicados, acessíveis publicamente.
 * COMPONENTES: Container, List, Link(PDF)
 * DADOS: getAnais(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Anais"}
      owner={"Igor"}
      rf={"RF06.6"}
      priority={"Pós-MVP"}
      summary={"Anais: trabalhos aceitos publicados, acessíveis publicamente."}
    />
  );
}
