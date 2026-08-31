/** Formulário da rota /cadastro. Brief e metadata ficam no page.tsx ao lado. */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { SENHA_MIN_CARACTERES, postCadastro } from "@/lib/api";

const cadastroSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.email("Informe um e-mail válido."),
    senha: z
      .string()
      .min(
        SENHA_MIN_CARACTERES,
        `A senha deve ter no mínimo ${SENHA_MIN_CARACTERES} caracteres.`,
      ),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
    aceiteTermos: z.boolean(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  })
  .refine((dados) => dados.aceiteTermos, {
    message: "É necessário aceitar os termos para criar a conta.",
    path: ["aceiteTermos"],
  });

type FormularioCadastro = z.infer<typeof cadastroSchema>;

export default function CadastroForm() {
  const router = useRouter();

  const [erro, setErro] = useState<string | null>(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [redirecionando, setRedirecionando] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioCadastro>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      aceiteTermos: false,
    },
  });

  async function onSubmit({ nome, email, senha }: FormularioCadastro) {
    setErro(null);
    try {
      await postCadastro({ nome, email, senha });
      setRedirecionando(true);
      router.push("/painel");
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível criar sua conta agora. Tente novamente.",
      );
    }
  }

  const carregando = isSubmitting || redirecionando;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          Criar conta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crie sua conta para se inscrever em eventos e acompanhar seus
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
            {...register("nome")}
            label="Nome completo"
            autoComplete="name"
            autoFocus
            fullWidth
            disabled={carregando}
            error={Boolean(errors.nome)}
            helperText={errors.nome?.message}
          />

          <TextField
            {...register("email")}
            label="E-mail"
            type="email"
            autoComplete="email"
            fullWidth
            disabled={carregando}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("senha")}
            label="Senha"
            type={senhaVisivel ? "text" : "password"}
            autoComplete="new-password"
            fullWidth
            disabled={carregando}
            error={Boolean(errors.senha)}
            helperText={
              errors.senha?.message ??
              `Mínimo de ${SENHA_MIN_CARACTERES} caracteres.`
            }
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

          <TextField
            {...register("confirmarSenha")}
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            fullWidth
            disabled={carregando}
            error={Boolean(errors.confirmarSenha)}
            helperText={errors.confirmarSenha?.message}
          />

          <Box>
            {/* Controller: o ref do Checkbox do MUI vai para o elemento raiz, não
                para o input, então register() sozinho não controla o valor. */}
            <Controller
              name="aceiteTermos"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      disabled={carregando}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Li e aceito os <Link href="/termos">termos de uso</Link> e
                      a <Link href="/privacidade">política de privacidade</Link>.
                    </Typography>
                  }
                />
              )}
            />
            {errors.aceiteTermos && (
              <FormHelperText error>
                {errors.aceiteTermos.message}
              </FormHelperText>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={carregando}
          >
            Criar conta
          </Button>
        </Stack>
      </Box>

      <Divider />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        Já tem uma conta? <Link href="/login">Entrar</Link>
      </Typography>
    </Stack>
  );
}
