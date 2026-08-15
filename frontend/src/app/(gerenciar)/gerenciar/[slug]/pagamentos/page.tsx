/**
 * ROTA: /gerenciar/[slug]/pagamentos
 * OWNER: Arthur   RF: RF04.4–7, RF03.2.7   PRIORIDADE: MVP
 * PROPÓSITO: Status de pagamentos, confirmação manual e relatório financeiro.
 * COMPONENTES: Table, Chip(status), Button(confirmar)
 * DADOS: getPagamentos(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Pagamentos"}
      owner={"Arthur"}
      rf={"RF04.4–7, RF03.2.7"}
      priority={"MVP"}
      summary={"Status de pagamentos, confirmação manual e relatório financeiro."}
    />
  );
}
