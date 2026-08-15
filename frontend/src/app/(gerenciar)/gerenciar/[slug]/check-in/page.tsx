/**
 * ROTA: /gerenciar/[slug]/check-in
 * OWNER: Arthur   RF: RF04.8   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Validação de check-in via QR Code na portaria.
 * COMPONENTES: Scanner QR, Alert
 * DADOS: postCheckin() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Check-in"}
      owner={"Arthur"}
      rf={"RF04.8"}
      priority={"Pós-MVP"}
      summary={"Validação de check-in via QR Code na portaria."}
    />
  );
}
