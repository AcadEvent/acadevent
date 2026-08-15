/**
 * ROTA: /gerenciar/[slug]/prazos
 * OWNER: Arthur   RF: RF01.2.1–5, RF01.3.1   PRIORIDADE: MVP
 * PROPÓSITO: Períodos do evento, inscrição e submissão; capacidade máxima.
 * COMPONENTES: DateTimePicker, TextField
 * DADOS: getPrazos(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Prazos"}
      owner={"Arthur"}
      rf={"RF01.2.1–5, RF01.3.1"}
      priority={"MVP"}
      summary={"Períodos do evento, inscrição e submissão; capacidade máxima."}
    />
  );
}
