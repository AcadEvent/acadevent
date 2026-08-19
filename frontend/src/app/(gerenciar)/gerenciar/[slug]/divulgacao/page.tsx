/**
 * ROTA: /gerenciar/[slug]/divulgacao
 * OWNER: Arthur   RF: RF12.1, RF12.3   PRIORIDADE: MVP
 * PROPÓSITO: Mídias, banners, flyers e exportação para redes sociais.
 * COMPONENTES: upload, Grid, Button(exportar)
 * DADOS: getDivulgacao(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Divulgação"}
      owner={"Arthur"}
      rf={"RF12.1, RF12.3"}
      priority={"MVP"}
      summary={"Mídias, banners, flyers e exportação para redes sociais."}
    />
  );
}
