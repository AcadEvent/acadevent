/**
 * ROTA: /eventos/[slug]/inscricao/atividades
 * OWNER: Igor   RF: RF05.3, RF05.4   PRIORIDADE: MVP
 * PROPÓSITO: Passo de seleção de atividades, respeitando capacidade e conflito de horário (alertar conflito).
 * COMPONENTES: List/Checkbox, Alert(conflito)
 * DADOS: getAtividades(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inscrição · Atividades"}
      owner={"Igor"}
      rf={"RF05.3, RF05.4"}
      priority={"MVP"}
      summary={"Passo de seleção de atividades, respeitando capacidade e conflito de horário (alertar conflito)."}
    />
  );
}
