/**
 * ROTA: /painel/eventos/[slug]/atividades/[id]/materiais
 * OWNER: Kauan   RF: RF10.3   PRIORIDADE: MVP
 * PROPÓSITO: Materiais da atividade — upload e (futuramente) download.
 * COMPONENTES: PageHeader, MaterialUpload, Alert
 * DADOS: upload via Server Action (POST /storage/upload, JWT).
 * ESTADOS: erro/sucesso dentro do MaterialUpload.
 * DONE: responsivo, tokens do tema. NOTA: sem endpoint de LISTAGEM de materiais
 *   por atividade no backend — a lista/controle por inscrição fica pendente.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import PageHeader from "@/components/layout/PageHeader";
import MaterialUpload from "@/components/domain/MaterialUpload";

import { uploadMaterialAction } from "./actions";

export const metadata: Metadata = { title: "Materiais da atividade" };

export default async function MateriaisAtividadePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  await params;

  return (
    <>
      <PageHeader
        title="Materiais da atividade"
        subtitle="Envie e compartilhe o conteúdo da atividade"
      />
      <Card variant="outlined">
        <CardContent>
          <MaterialUpload onUploadAction={uploadMaterialAction} />
        </CardContent>
      </Card>
      <Alert severity="info" sx={{ mt: 3 }}>
        A listagem de materiais por atividade (e o download restrito a inscritos)
        depende de evolução do backend — hoje o storage só expõe upload e
        download por link direto.
      </Alert>
    </>
  );
}
