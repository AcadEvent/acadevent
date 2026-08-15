/**
 * ROTA: /redefinir-senha/[token]
 * OWNER: Kauan   RF: RF02.1.4   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Definição de nova senha via link com token.
 * COMPONENTES: TextField, Button
 * DADOS: postRedefinirSenha(token) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Redefinir senha"}
      owner={"Kauan"}
      rf={"RF02.1.4"}
      priority={"Pós-MVP"}
      summary={"Definição de nova senha via link com token."}
    />
  );
}
