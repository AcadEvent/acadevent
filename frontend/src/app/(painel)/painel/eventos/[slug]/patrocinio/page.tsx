/**
 * ROTA: /painel/eventos/[slug]/patrocinio
 * OWNER: Kauan   RF: RF02.2.2   PRIORIDADE: MVP
 * PROPÓSITO: Dados de visibilidade e gestão do perfil de patrocínio.
 * COMPONENTES: TextField, upload(logo)
 * DADOS: getPatrocinio(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Patrocínio"}
      owner={"Kauan"}
      rf={"RF02.2.2"}
      priority={"MVP"}
      summary={"Dados de visibilidade e gestão do perfil de patrocínio."}
    />
  );
}
