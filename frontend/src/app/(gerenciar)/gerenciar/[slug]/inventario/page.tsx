/**
 * ROTA: /gerenciar/[slug]/inventario
 * OWNER: Arthur   RF: RF08.1–4   PRIORIDADE: MVP
 * PROPÓSITO: Itens, distribuição/baixa e alertas de estoque.
 * COMPONENTES: Table, Dialog, Alert(estoque)
 * DADOS: getInventario(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Inventário"}
      owner={"Arthur"}
      rf={"RF08.1–4"}
      priority={"MVP"}
      summary={"Itens, distribuição/baixa e alertas de estoque."}
    />
  );
}
