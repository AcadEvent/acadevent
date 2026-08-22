/**
 * ROTA: /gerenciar/eventos/novo
 * OWNER: Arthur   RF: RF01.1.1–5   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de novo evento (dados cadastrais e identidade visual).
 * COMPONENTES: TextField, DatePicker, upload (react-hook-form + zod)
 * DADOS: postEvento() (via src/lib/api — nunca fetch direto)
 * ESTADOS: erro de envio (Alert) tratado no formulário
 * DONE: página (server) monta o shell + metadata; formulário isolado em
 *   NovoEventoForm.tsx (client). Ver docs/atribuicoes.md.
 */
import type { Metadata } from "next";

import Container from "@mui/material/Container";

import PageHeader from "@/components/layout/PageHeader";

import NovoEventoForm from "./NovoEventoForm";

export const metadata: Metadata = {
  title: "Novo evento",
};

export default function NovoEventoPage() {
  return (
    <Container maxWidth="md" disableGutters>
      <PageHeader
        title="Novo evento"
        subtitle="Cadastre as informações iniciais. O evento será criado como rascunho."
      />
      <NovoEventoForm />
    </Container>
  );
}
