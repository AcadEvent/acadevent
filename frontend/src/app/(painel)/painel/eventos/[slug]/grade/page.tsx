/**
 * ROTA: /painel/eventos/[slug]/grade
 * OWNER: Kauan   RF: RF03.1.6   PRIORIDADE: MVP
 * PROPÓSITO: Grade personalizada com as atividades inscritas.
 * COMPONENTES: Tabs(dia), List
 * DADOS: getMinhaGrade(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Minha grade"}
      owner={"Kauan"}
      rf={"RF03.1.6"}
      priority={"MVP"}
      summary={"Grade personalizada com as atividades inscritas."}
    />
  );
}
