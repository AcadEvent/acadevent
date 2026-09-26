/** Formulário da rota /login. Brief e metadata ficam no page.tsx ao lado. */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { entrarAction } from "@/lib/auth/actions";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});

type FormularioLogin = z.infer<typeof loginSchema>;

/**
 * Destino pós-login. Aceita apenas caminho interno: "//host" e "/\host" são
 * lidos como URL externa pelo navegador e abririam um open redirect.
 */
function destinoSeguro(redirect: string | null): string {
  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect[1] === "/" ||
    redirect[1] === "\\"
  ) {
    return "/painel";
  }
  return redirect;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = destinoSeguro(searchParams?.get("redirect") ?? null);

  const [erro, setErro] = useState<string | null>(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [redirecionando, setRedirecionando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(dados: FormularioLogin) {
    setErro(null);
    const resultado = await entrarAction(dados);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setRedirecionando(true);
    router.push(destino);
    router.refresh();
  }

  const carregando = isSubmitting || redirecionando;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          Entrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acesse sua conta para acompanhar inscrições, atividades e
          certificados.
        </Typography>
      </Box>

      {erro && (
        <Alert severity="error" onClose={() => setErro(null)}>
          {erro}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            {...register("email")}
            label="E-mail"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            disabled={carregando}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("senha")}
            label="Senha"
            type={senhaVisivel ? "text" : "password"}
            autoComplete="current-password"
            fullWidth
            disabled={carregando}
            error={Boolean(errors.senha)}
            helperText={errors.senha?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSenhaVisivel((v) => !v)}
                      edge="end"
                      aria-label={
                        senhaVisivel ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {senhaVisivel ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/recuperar-senha" variant="body2">
              Esqueci minha senha
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={carregando}
          >
            Entrar
          </Button>
        </Stack>
      </Box>

      <Divider />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        Não tem uma conta? <Link href="/cadastro">Criar conta</Link>
      </Typography>
    </Stack>
  );
}
