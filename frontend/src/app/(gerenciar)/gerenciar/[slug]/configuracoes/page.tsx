/**
 * ROTA: /gerenciar/[slug]/configuracoes
 * OWNER: Arthur   RF: RF01.1.1–6   PRIORIDADE: MVP
 * PROPÓSITO: Dados cadastrais, identidade visual, local e redes sociais.
 * COMPONENTES: TextField, upload
 * DADOS: getConfig(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Configurações"}
      owner={"Arthur"}
      rf={"RF01.1.1–6"}
      priority={"MVP"}
      summary={"Dados cadastrais, identidade visual, local e redes sociais."}
    />
  );
}
