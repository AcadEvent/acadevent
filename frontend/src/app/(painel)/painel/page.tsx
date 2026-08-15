/**
 * ROTA: /painel
 * OWNER: Kauan   RF: RF03.1.1, RF03.1.5   PRIORIDADE: MVP
 * PROPÓSITO: Hub pessoal multi-evento: meus eventos, atalhos e notificações.
 * COMPONENTES: PageHeader, Grid, EventCard, List
 * DADOS: getMeusEventos() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Meu painel"}
      owner={"Kauan"}
      rf={"RF03.1.1, RF03.1.5"}
      priority={"MVP"}
      summary={"Hub pessoal multi-evento: meus eventos, atalhos e notificações."}
    />
  );
}
