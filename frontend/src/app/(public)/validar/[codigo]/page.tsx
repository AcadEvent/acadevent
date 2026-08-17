/**
 * ROTA: /validar/[codigo]
 * OWNER: Igor   RF: RF11.7   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Validação pública de autenticidade de um certificado pelo código.
 * COMPONENTES: Container, Alert(resultado), Card
 * DADOS: getValidacaoCertificado(codigo) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Validar certificado"}
      owner={"Igor"}
      rf={"RF11.7"}
      priority={"Pós-MVP"}
      summary={"Validação pública de autenticidade de um certificado pelo código."}
    />
  );
}
