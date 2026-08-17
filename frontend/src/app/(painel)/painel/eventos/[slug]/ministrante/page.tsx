/**
 * ROTA: /painel/eventos/[slug]/ministrante
 * OWNER: Kauan   RF: RF02.2.3, RF05.5   PRIORIDADE: MVP
 * PROPÓSITO: Painel do ministrante: minhas atividades no evento.
 * COMPONENTES: Grid, Card
 * DADOS: getMinhasAtividadesMinistrante(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Painel do ministrante"}
      owner={"Kauan"}
      rf={"RF02.2.3, RF05.5"}
      priority={"MVP"}
      summary={"Painel do ministrante: minhas atividades no evento."}
    />
  );
}
