/**
 * ROTA: /gerenciar/[slug]/materiais
 * OWNER: Arthur   RF: RF10.1   PRIORIDADE: MVP
 * PROPÓSITO: Upload de conteúdo digital do evento (PDF, slides, imagens).
 * COMPONENTES: PageHeader, MaterialUpload, Alert
 * DADOS: upload via Server Action (POST /storage/upload, JWT). Ver @/lib/api.
 * ESTADOS: erro/sucesso dentro do MaterialUpload.
 * DONE: responsivo, tokens do tema. NOTA: o backend de storage é genérico —
 *   não há endpoint para LISTAR materiais por evento (limitação documentada).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import PageHeader from "@/components/layout/PageHeader";
import MaterialUpload from "@/components/domain/MaterialUpload";

import { uploadMaterialAction } from "./actions";

export const metadata: Metadata = { title: "Materiais" };

export default async function MateriaisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;

  return (
    <>
      <PageHeader
        title="Materiais"
        subtitle="Envie PDFs, slides e imagens do evento"
      />
      <Card variant="outlined">
        <CardContent>
          <MaterialUpload onUploadAction={uploadMaterialAction} />
        </CardContent>
      </Card>
      <Alert severity="info" sx={{ mt: 3 }}>
        A listagem de materiais por evento depende de evolução do backend (o
        storage atual só expõe upload e download por link).
      </Alert>
    </>
  );
}
