/**
 * ROTA: /eventos/[slug]/atividades/[id]
 * OWNER: Igor   RF: RF05.1, RF05.5   PRIORIDADE: MVP
 * PROPÓSITO: Detalhe da atividade: descrição, ministrantes, horário e vagas.
 * COMPONENTES: Container, PageHeader, Chip, List
 * DADOS: getAtividade(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Detalhe da atividade"}
      owner={"Igor"}
      rf={"RF05.1, RF05.5"}
      priority={"MVP"}
      summary={"Detalhe da atividade: descrição, ministrantes, horário e vagas."}
    />
  );
}
