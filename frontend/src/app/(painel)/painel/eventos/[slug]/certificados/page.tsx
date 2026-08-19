/**
 * ROTA: /painel/eventos/[slug]/certificados
 * OWNER: Kauan   RF: RF03.1.4, RF11.1   PRIORIDADE: MVP
 * PROPÓSITO: Download de certificados após o encerramento do evento.
 * COMPONENTES: List, Button(PDF)
 * DADOS: getCertificados(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Certificados"}
      owner={"Kauan"}
      rf={"RF03.1.4, RF11.1"}
      priority={"MVP"}
      summary={"Download de certificados após o encerramento do evento."}
    />
  );
}
