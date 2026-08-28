/**
 * ROTA: /cadastro
 * OWNER: Kauan   RF: RF02.1.1   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de novo usuário (e-mail + senha).
 * COMPONENTES: TextField, Checkbox, Button (react-hook-form + zod), em
 *   CadastroForm.tsx
 * DADOS: postCadastro() (via src/lib/api, nunca fetch direto)
 * ESTADOS: loading (Button loading no envio) / erro (Alert e helperText por
 *   campo, RNF04.3). Vazio não se aplica a formulário.
 * DONE: responsivo, tokens do tema, estados cobertos, placeholder substituído.
 *
 * Server component só para poder exportar metadata. O formulário precisa de
 * hooks, então vive em CadastroForm.tsx. O card e a marca vêm do
 * (auth)/layout.tsx.
 */
import type { Metadata } from "next";

import CadastroForm from "./CadastroForm";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function Page() {
  return <CadastroForm />;
}
