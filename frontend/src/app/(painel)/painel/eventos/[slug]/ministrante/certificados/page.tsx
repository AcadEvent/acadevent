/**
 * ROTA: /painel/eventos/[slug]/ministrante/certificados
 * OWNER: Kauan   RF: RF11.2   PRIORIDADE: MVP
 * PROPÓSITO: Certificados do ministrante.
 * COMPONENTES: List, Button(PDF)
 * DADOS: getCertificadosMinistrante(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Certificados do ministrante"}
      owner={"Kauan"}
      rf={"RF11.2"}
      priority={"MVP"}
      summary={"Certificados do ministrante."}
    />
  );
}
