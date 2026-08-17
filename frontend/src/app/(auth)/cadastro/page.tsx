/**
 * ROTA: /cadastro
 * OWNER: Kauan   RF: RF02.1.1   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de novo usuário (e-mail + senha).
 * COMPONENTES: TextField, Button (react-hook-form + zod)
 * DADOS: postCadastro() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Criar conta"}
      owner={"Kauan"}
      rf={"RF02.1.1"}
      priority={"MVP"}
      summary={"Cadastro de novo usuário (e-mail + senha)."}
    />
  );
}
