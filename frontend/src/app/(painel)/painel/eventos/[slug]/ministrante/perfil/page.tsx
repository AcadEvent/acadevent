/**
 * ROTA: /painel/eventos/[slug]/ministrante/perfil
 * OWNER: Kauan   RF: RF02.2.4   PRIORIDADE: MVP
 * PROPÓSITO: Dados profissionais por evento (bio, foto, instituição).
 * COMPONENTES: TextField, upload
 * DADOS: getPerfilMinistrante(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Perfil do ministrante"}
      owner={"Kauan"}
      rf={"RF02.2.4"}
      priority={"MVP"}
      summary={"Dados profissionais por evento (bio, foto, instituição)."}
    />
  );
}
