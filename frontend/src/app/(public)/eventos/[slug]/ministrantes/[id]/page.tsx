/**
 * ROTA: /eventos/[slug]/ministrantes/[id]
 * OWNER: Igor   RF: RF02.2.4   PRIORIDADE: MVP
 * PROPÓSITO: Perfil público do ministrante (bio, instituição, área).
 * COMPONENTES: Container, Avatar, Typography
 * DADOS: getMinistrante(slug,id) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Perfil do ministrante"}
      owner={"Igor"}
      rf={"RF02.2.4"}
      priority={"MVP"}
      summary={"Perfil público do ministrante (bio, instituição, área)."}
    />
  );
}
