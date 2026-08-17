/**
 * ROTA: /painel/eventos/[slug]/ministrante/atividades/[id]/presenca
 * OWNER: Kauan   RF: RF05.6   PRIORIDADE: MVP
 * PROPÓSITO: Registro de frequência/presença dos participantes na atividade.
 * COMPONENTES: Table, Checkbox, Button
 * DADOS: getParticipantesAtividade(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Presença"}
      owner={"Kauan"}
      rf={"RF05.6"}
      priority={"MVP"}
      summary={"Registro de frequência/presença dos participantes na atividade."}
    />
  );
}
