/**
 * ROTA: /eventos/[slug]/galeria
 * OWNER: Igor   RF: RF12.2   PRIORIDADE: MVP
 * PROPÓSITO: Galeria pública de fotos e mídias do evento.
 * COMPONENTES: Container, ImageList
 * DADOS: getGaleria(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Galeria"}
      owner={"Igor"}
      rf={"RF12.2"}
      priority={"MVP"}
      summary={"Galeria pública de fotos e mídias do evento."}
    />
  );
}
