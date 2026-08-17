/**
 * ROTA: /gerenciar/[slug]/escala
 * OWNER: Arthur   RF: RF02.2.6–12   PRIORIDADE: MVP
 * PROPÓSITO: Turnos, carga horária, validação de presença e conflitos de escala.
 * COMPONENTES: Table, Alert(conflito), DateTimePicker
 * DADOS: getEscala(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Escala"}
      owner={"Arthur"}
      rf={"RF02.2.6–12"}
      priority={"MVP"}
      summary={"Turnos, carga horária, validação de presença e conflitos de escala."}
    />
  );
}
