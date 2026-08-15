/**
 * ROTA: /painel/eventos/[slug]/escala
 * OWNER: Kauan   RF: RF02.2.6, RF02.2.7   PRIORIDADE: MVP
 * PROPÓSITO: Meus turnos e carga horária acumulada.
 * COMPONENTES: Table, Typography(total)
 * DADOS: getMinhaEscala(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Minha escala"}
      owner={"Kauan"}
      rf={"RF02.2.6, RF02.2.7"}
      priority={"MVP"}
      summary={"Meus turnos e carga horária acumulada."}
    />
  );
}
