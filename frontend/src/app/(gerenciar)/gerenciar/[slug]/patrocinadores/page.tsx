/**
 * ROTA: /gerenciar/[slug]/patrocinadores
 * OWNER: Arthur   RF: RF02.2.2   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de patrocinadores e níveis de patrocínio.
 * COMPONENTES: Table, Dialog, upload
 * DADOS: getPatrocinadores(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Patrocinadores"}
      owner={"Arthur"}
      rf={"RF02.2.2"}
      priority={"MVP"}
      summary={"Cadastro de patrocinadores e níveis de patrocínio."}
    />
  );
}
