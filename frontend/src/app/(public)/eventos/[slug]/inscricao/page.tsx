/**
 * ROTA: /eventos/[slug]/inscricao
 * OWNER: Igor   RF: RF01.5.3, RNF04.4   PRIORIDADE: MVP
 * PROPÓSITO: Fluxo de inscrição no evento em rota única (Stepper, ≤5 passos). Requer autenticação (checar sessão na página).
 * COMPONENTES: Container, Stepper, Button
 * DADOS: getEvento(slug), getLotes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inscrição"}
      owner={"Igor"}
      rf={"RF01.5.3, RNF04.4"}
      priority={"MVP"}
      summary={"Fluxo de inscrição no evento em rota única (Stepper, ≤5 passos). Requer autenticação (checar sessão na página)."}
    />
  );
}
