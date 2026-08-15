/**
 * ROTA: /recuperar-senha
 * OWNER: Kauan   RF: RF02.1.4   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Solicitação de recuperação de senha por e-mail.
 * COMPONENTES: TextField, Button
 * DADOS: postRecuperarSenha() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Recuperar senha"}
      owner={"Kauan"}
      rf={"RF02.1.4"}
      priority={"Pós-MVP"}
      summary={"Solicitação de recuperação de senha por e-mail."}
    />
  );
}
