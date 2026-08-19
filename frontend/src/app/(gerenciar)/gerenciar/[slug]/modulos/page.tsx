/**
 * ROTA: /gerenciar/[slug]/modulos
 * OWNER: Arthur   RF: RF01.3.2–6, RF03.2.2   PRIORIDADE: MVP
 * PROPÓSITO: Ativar/desativar módulos, status e edições do evento.
 * COMPONENTES: Switch, Select(status)
 * DADOS: getModulos(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Módulos"}
      owner={"Arthur"}
      rf={"RF01.3.2–6, RF03.2.2"}
      priority={"MVP"}
      summary={"Ativar/desativar módulos, status e edições do evento."}
    />
  );
}
