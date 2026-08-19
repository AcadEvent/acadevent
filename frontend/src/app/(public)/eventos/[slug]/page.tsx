/**
 * ROTA: /eventos/[slug]
 * OWNER: Guilherme   RF: RF01.5.1–4   PRIORIDADE: MVP
 * PROPÓSITO: Página pública do evento: dados cadastrais, status de inscrição, botão de inscrever e navegação para cronograma/atividades/ministrantes/patrocinadores.
 * COMPONENTES: Container, PageHeader, Chip(status), Button(inscrever), Tabs/links, EventCard
 * DADOS: getEvento(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Página do evento"}
      owner={"Guilherme"}
      rf={"RF01.5.1–4"}
      priority={"MVP"}
      summary={"Página pública do evento: dados cadastrais, status de inscrição, botão de inscrever e navegação para cronograma/atividades/ministrantes/patrocinadores."}
    />
  );
}
