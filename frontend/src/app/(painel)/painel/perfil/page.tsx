/**
 * ROTA: /painel/perfil
 * OWNER: Kauan   RF: RF02.1.1   PRIORIDADE: MVP
 * PROPÓSITO: Dados da conta do usuário.
 * COMPONENTES: TextField, Button
 * DADOS: getPerfil() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Perfil"}
      owner={"Kauan"}
      rf={"RF02.1.1"}
      priority={"MVP"}
      summary={"Dados da conta do usuário."}
    />
  );
}
