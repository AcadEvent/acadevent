/**
 * ROTA: /gerenciar/[slug]/espacos
 * OWNER: Arthur   RF: RF07.1–4   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de espaços e reservas (conflito/capacidade); mapa de ocupação.
 * COMPONENTES: Table, Dialog, Calendar
 * DADOS: getEspacos(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Espaços"}
      owner={"Arthur"}
      rf={"RF07.1–4"}
      priority={"MVP"}
      summary={"Cadastro de espaços e reservas (conflito/capacidade); mapa de ocupação."}
    />
  );
}
