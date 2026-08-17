/**
 * ROTA: /gerenciar/[slug]/ministrantes
 * OWNER: Arthur   RF: RF02.2.3   PRIORIDADE: MVP
 * PROPÓSITO: Convidar/cadastrar ministrantes do evento.
 * COMPONENTES: Table, Dialog
 * DADOS: getMinistrantes(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Ministrantes"}
      owner={"Arthur"}
      rf={"RF02.2.3"}
      priority={"MVP"}
      summary={"Convidar/cadastrar ministrantes do evento."}
    />
  );
}
