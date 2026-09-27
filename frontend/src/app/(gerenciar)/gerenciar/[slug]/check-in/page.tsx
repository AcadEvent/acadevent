/**
 * ROTA: /gerenciar/[slug]/check-in
 * OWNER: Arthur   RF: RF04.8   PRIORIDADE: SH
 * PROPÓSITO: Validação de check-in por código na portaria (QR pode preencher o
 *   mesmo campo). Rejeita repetição do mesmo código.
 * COMPONENTES: PageHeader, TextField + Button (CheckinForm), Alert
 * DADOS: validarCheckin(slug, codigo) (via @/lib/api)
 * ESTADOS: resultado (Alert success/warning/error)
 * DONE: responsivo (usável em viewport estreita), tokens do tema.
 */
import type { Metadata } from "next";

import Typography from "@mui/material/Typography";

import PageHeader from "@/components/layout/PageHeader";

import CheckinForm from "./CheckinForm";

export const metadata: Metadata = {
  title: "Check-in",
};

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <PageHeader
        title="Check-in"
        subtitle="Valide a entrada dos participantes por código."
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Informe o código do ingresso (ex.: SITC26-0001). Um código já validado
        não é aceito de novo.
      </Typography>
      <CheckinForm eventoSlug={slug} />
    </>
  );
}
