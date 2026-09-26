import type { ReactNode } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import { getSession } from "@/lib/auth/session";

import { AUTH_ENABLED } from "./wizard";

/**
 * Guarda de autenticação de TODO o fluxo de inscrição (RF02.1.2). Um único ponto
 * — em vez de cada passo se proteger por conta própria — garante que os 4 passos
 * (Dados, Atividades, Pagamento, Confirmação) exijam sessão. Antes a confirmação
 * ficava sem gate (issue #41/#43).
 *
 * Enquanto AUTH_ENABLED = false (sem o contrato de sessão, #74) fica dormente e
 * apenas repassa os filhos, permitindo ao time percorrer o fluxo com mock. Ao
 * ligar, todos os passos passam a exigir login.
 */
export default async function InscricaoLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessao = await getSession();

  if (AUTH_ENABLED && !sessao) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              href={`/login?redirect=/eventos/${slug}/inscricao`}
            >
              Entrar
            </Button>
          }
        >
          <AlertTitle>Entre para se inscrever</AlertTitle>
          É preciso estar autenticado para se inscrever neste evento.
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
}
