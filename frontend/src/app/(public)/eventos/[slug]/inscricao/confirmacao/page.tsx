/**
 * ROTA: /eventos/[slug]/inscricao/confirmacao
 * OWNER: Igor   RF: RF04.6, RF09.1   PRIORIDADE: MVP
 * PROPÓSITO: Confirmação da inscrição + recibo.
 * COMPONENTES: Alert(sucesso), Button(baixar recibo)
 * DADOS: getInscricao() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inscrição · Confirmação"}
      owner={"Igor"}
      rf={"RF04.6, RF09.1"}
      priority={"MVP"}
      summary={"Confirmação da inscrição + recibo."}
    />
  );
}
