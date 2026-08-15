/**
 * ROTA: /eventos/[slug]/inscricao/pagamento
 * OWNER: Igor   RF: RF04.1–4, RF04.9   PRIORIDADE: MVP
 * PROPÓSITO: Checkout: seleção de lote, aplicação de cupom e status de pagamento. Anti-bot (CAPTCHA/token de sessão).
 * COMPONENTES: RadioGroup(lote), TextField(cupom), Button
 * DADOS: getLotes(slug), aplicarCupom() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inscrição · Pagamento"}
      owner={"Igor"}
      rf={"RF04.1–4, RF04.9"}
      priority={"MVP"}
      summary={"Checkout: seleção de lote, aplicação de cupom e status de pagamento. Anti-bot (CAPTCHA/token de sessão)."}
    />
  );
}
