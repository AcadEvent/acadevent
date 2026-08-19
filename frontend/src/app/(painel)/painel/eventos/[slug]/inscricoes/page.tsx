/**
 * ROTA: /painel/eventos/[slug]/inscricoes
 * OWNER: Kauan   RF: RF03.1.2   PRIORIDADE: MVP
 * PROPÓSITO: Histórico de inscrições e status de pagamento.
 * COMPONENTES: Table, Chip(status)
 * DADOS: getMinhasInscricoes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Minhas inscrições"}
      owner={"Kauan"}
      rf={"RF03.1.2"}
      priority={"MVP"}
      summary={"Histórico de inscrições e status de pagamento."}
    />
  );
}
