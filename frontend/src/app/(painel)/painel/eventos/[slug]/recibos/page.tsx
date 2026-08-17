/**
 * ROTA: /painel/eventos/[slug]/recibos
 * OWNER: Kauan   RF: RF03.1.3   PRIORIDADE: MVP
 * PROPÓSITO: Download de recibos de pagamento.
 * COMPONENTES: List, Button(PDF)
 * DADOS: getRecibos(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Recibos"}
      owner={"Kauan"}
      rf={"RF03.1.3"}
      priority={"MVP"}
      summary={"Download de recibos de pagamento."}
    />
  );
}
