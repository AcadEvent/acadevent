/**
 * ROTA: /termos
 * OWNER: Guilherme   RF: institucional   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Termos de uso da plataforma.
 * COMPONENTES: Container, Typography
 * DADOS: estático (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Termos de uso"}
      owner={"Guilherme"}
      rf={"institucional"}
      priority={"Pós-MVP"}
      summary={"Termos de uso da plataforma."}
    />
  );
}
