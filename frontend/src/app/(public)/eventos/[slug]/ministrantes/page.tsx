/**
 * ROTA: /eventos/[slug]/ministrantes
 * OWNER: Igor   RF: RF02.2.5, RF01.5.2   PRIORIDADE: MVP
 * PROPÓSITO: Lista de ministrantes com dados profissionais.
 * COMPONENTES: Container, Grid, Card(Avatar)
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
      owner={"Igor"}
      rf={"RF02.2.5, RF01.5.2"}
      priority={"MVP"}
      summary={"Lista de ministrantes com dados profissionais."}
    />
  );
}
