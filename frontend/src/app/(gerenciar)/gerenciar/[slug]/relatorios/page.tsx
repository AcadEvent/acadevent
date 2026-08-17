/**
 * ROTA: /gerenciar/[slug]/relatorios
 * OWNER: Arthur   RF: RF13.1–9   PRIORIDADE: MVP
 * PROPÓSITO: Relatórios (inscritos, financeiro, presença, escala...) exportáveis em PDF/CSV.
 * COMPONENTES: Table, Button(export PDF/CSV)
 * DADOS: getRelatorios(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Relatórios"}
      owner={"Arthur"}
      rf={"RF13.1–9"}
      priority={"MVP"}
      summary={"Relatórios (inscritos, financeiro, presença, escala...) exportáveis em PDF/CSV."}
    />
  );
}
