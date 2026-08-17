/**
 * ROTA: /gerenciar/eventos/novo
 * OWNER: Arthur   RF: RF01.1.1–5   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de novo evento (nome, sigla, edição, instituição, local, logo).
 * COMPONENTES: TextField, DatePicker, upload (react-hook-form + zod)
 * DADOS: postEvento() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Novo evento"}
      owner={"Arthur"}
      rf={"RF01.1.1–5"}
      priority={"MVP"}
      summary={"Cadastro de novo evento (nome, sigla, edição, instituição, local, logo)."}
    />
  );
}
