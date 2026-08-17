/**
 * ROTA: /gerenciar/[slug]/inscricoes
 * OWNER: Arthur   RF: RF04.1–3, RF03.2.3   PRIORIDADE: MVP
 * PROPÓSITO: Gestão de inscrições, lotes e cupons.
 * COMPONENTES: Table, Dialog(lote/cupom)
 * DADOS: getInscricoes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inscrições"}
      owner={"Arthur"}
      rf={"RF04.1–3, RF03.2.3"}
      priority={"MVP"}
      summary={"Gestão de inscrições, lotes e cupons."}
    />
  );
}
