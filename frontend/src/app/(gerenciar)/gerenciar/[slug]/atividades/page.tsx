/**
 * ROTA: /gerenciar/[slug]/atividades
 * OWNER: Arthur   RF: RF05.1, RF05.5, RF03.2.9   PRIORIDADE: MVP
 * PROPÓSITO: CRUD de atividades e associação de ministrantes.
 * COMPONENTES: Table, Dialog(form), DateTimePicker
 * DADOS: getAtividades(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Atividades"}
      owner={"Arthur"}
      rf={"RF05.1, RF05.5, RF03.2.9"}
      priority={"MVP"}
      summary={"CRUD de atividades e associação de ministrantes."}
    />
  );
}
