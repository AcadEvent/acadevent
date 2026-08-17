/**
 * ROTA: /eventos/[slug]/patrocinadores
 * OWNER: Igor   RF: RF01.5.2, RF02.2.2   PRIORIDADE: MVP
 * PROPÓSITO: Patrocinadores agrupados por nível de patrocínio.
 * COMPONENTES: Container, Grid, Card(logo)
 * DADOS: getPatrocinadores(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Patrocinadores"}
      owner={"Igor"}
      rf={"RF01.5.2, RF02.2.2"}
      priority={"MVP"}
      summary={"Patrocinadores agrupados por nível de patrocínio."}
    />
  );
}
