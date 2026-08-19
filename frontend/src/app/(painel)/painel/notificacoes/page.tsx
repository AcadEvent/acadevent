/**
 * ROTA: /painel/notificacoes
 * OWNER: Kauan   RF: RF03.1.5, RF09.4   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Central de notificações do usuário.
 * COMPONENTES: List, Badge
 * DADOS: getNotificacoes() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Notificações"}
      owner={"Kauan"}
      rf={"RF03.1.5, RF09.4"}
      priority={"Pós-MVP"}
      summary={"Central de notificações do usuário."}
    />
  );
}
