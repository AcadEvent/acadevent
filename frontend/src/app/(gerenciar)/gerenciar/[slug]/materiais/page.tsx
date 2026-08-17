/**
 * ROTA: /gerenciar/[slug]/materiais
 * OWNER: Arthur   RF: RF10.1   PRIORIDADE: MVP
 * PROPÓSITO: Repositório de conteúdo digital do evento.
 * COMPONENTES: upload, List
 * DADOS: getMateriais(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Materiais"}
      owner={"Arthur"}
      rf={"RF10.1"}
      priority={"MVP"}
      summary={"Repositório de conteúdo digital do evento."}
    />
  );
}
