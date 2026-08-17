/**
 * ROTA: /admin/eventos
 * OWNER: Igor   RF: RF01.3.6   PRIORIDADE: MVP
 * PROPÓSITO: Múltiplos eventos: arquivar/excluir.
 * COMPONENTES: Table, Button
 * DADOS: getAdminEventos() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Eventos (admin)"}
      owner={"Igor"}
      rf={"RF01.3.6"}
      priority={"MVP"}
      summary={"Múltiplos eventos: arquivar/excluir."}
    />
  );
}
