/**
 * ROTA: /login
 * OWNER: Kauan   RF: RF02.1.1, RNF03.1   PRIORIDADE: MVP
 * PROPÓSITO: Login por e-mail e senha.
 * COMPONENTES: TextField, Button (react-hook-form + zod), em LoginForm.tsx
 * DADOS: postLogin() (via src/lib/api, nunca fetch direto)
 * ESTADOS: loading (Skeleton no fallback, Button loading no envio) /
 *   erro (Alert). Vazio não se aplica a formulário.
 * DONE: responsivo, tokens do tema, estados cobertos, placeholder substituído.
 *
 * Server component só para poder exportar metadata. O formulário precisa de
 * hooks, então vive em LoginForm.tsx. O card e a marca vêm do (auth)/layout.tsx.
 */
import type { Metadata } from "next";
import { Suspense } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

function LoginSkeleton() {
  return (
    <Stack spacing={3}>
      <Box>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="90%" />
      </Box>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={48} />
    </Stack>
  );
}

export default function Page() {
  // useSearchParams() no LoginForm exige um boundary de Suspense acima.
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
