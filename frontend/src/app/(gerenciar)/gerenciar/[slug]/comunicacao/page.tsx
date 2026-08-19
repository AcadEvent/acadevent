/**
 * ROTA: /gerenciar/[slug]/comunicacao
 * OWNER: Arthur   RF: RF09.2–4   PRIORIDADE: MVP
 * PROPÓSITO: Comunicados gerais e segmentados por perfil.
 * COMPONENTES: TextField, Select(segmento), Button
 * DADOS: postComunicado() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Comunicação"}
      owner={"Arthur"}
      rf={"RF09.2–4"}
      priority={"MVP"}
      summary={"Comunicados gerais e segmentados por perfil."}
    />
  );
}
