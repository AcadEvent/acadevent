/**
 * ROTA: /admin/usuarios
 * OWNER: Igor   RF: RF02.1.3   PRIORIDADE: MVP
 * PROPÓSITO: Gestão de usuários: perfis de acesso e exclusão.
 * COMPONENTES: Table, Dialog
 * DADOS: getUsuarios() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Usuários"}
      owner={"Igor"}
      rf={"RF02.1.3"}
      priority={"MVP"}
      summary={"Gestão de usuários: perfis de acesso e exclusão."}
    />
  );
}
