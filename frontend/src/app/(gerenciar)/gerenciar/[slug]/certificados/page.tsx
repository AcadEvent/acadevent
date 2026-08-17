/**
 * ROTA: /gerenciar/[slug]/certificados
 * OWNER: Arthur   RF: RF01.4.1–4, RF11.1–7   PRIORIDADE: MVP
 * PROPÓSITO: Configuração e emissão de certificados (template, signatários, texto).
 * COMPONENTES: TextField, upload(assinatura), Button(emitir)
 * DADOS: getConfigCertificado(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      title={"Certificados"}
      owner={"Arthur"}
      rf={"RF01.4.1–4, RF11.1–7"}
      priority={"MVP"}
      summary={"Configuração e emissão de certificados (template, signatários, texto)."}
    />
  );
}
