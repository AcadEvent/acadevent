/**
 * ROTA: /gerenciar/eventos
 * OWNER: Arthur   RF: RF01.3.3   PRIORIDADE: MVP
 * PROPÓSITO: Lista de eventos que o usuário organiza.
 * COMPONENTES: Grid, EventCard, Button(novo)
 * DADOS: getEventosOrganizador() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Meus eventos"}
      owner={"Arthur"}
      rf={"RF01.3.3"}
      priority={"MVP"}
      summary={"Lista de eventos que o usuário organiza."}
    />
  );
}
