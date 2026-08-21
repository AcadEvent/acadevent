"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import type { CategoriaParticipante } from "@/lib/types";

const CATEGORIAS: { valor: CategoriaParticipante; rotulo: string }[] = [
  { valor: "estudante", rotulo: "Estudante" },
  { valor: "docente", rotulo: "Docente" },
  { valor: "profissional", rotulo: "Profissional" },
  { valor: "outro", rotulo: "Outro" },
];

const esquema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(255, "Nome muito longo."),
  email: z.email("Informe um e-mail válido."),
  instituicao: z.string().trim().max(255, "Nome muito longo.").optional(),
  categoria: z.enum(["estudante", "docente", "profissional", "outro"], {
    message: "Selecione uma categoria.",
  }),
  aceiteTermos: z.literal(true, {
    message: "É preciso aceitar os termos para continuar.",
  }),
});

type Formulario = z.infer<typeof esquema>;

export interface InscricaoFormProps {
  eventoSlug: string;
  /** Bloqueia a edição quando as inscrições não estão abertas (RF01.5.3). */
  bloqueado?: boolean;
  /** Pré-preenchimento vindo da sessão, quando houver. */
  nomePadrao?: string;
  emailPadrao?: string;
}

/**
 * Passo 1 do wizard de inscrição: dados do participante (RF01.5.3, RNF04.4).
 * Client Component porque usa react-hook-form + zod; os dados do evento vêm
 * resolvidos do Server Component da página (ver page.tsx).
 */
export default function InscricaoForm({
  eventoSlug,
  bloqueado = false,
  nomePadrao = "",
  emailPadrao = "",
}: InscricaoFormProps) {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nomeCompleto: nomePadrao,
      email: emailPadrao,
      instituicao: "",
      categoria: "estudante",
      aceiteTermos: false as unknown as true,
    },
  });

  const onSubmit = handleSubmit(() => {
    // TODO(api): persistir os dados do participante (criarInscricao) quando a
    // API NestJS existir; por ora o passo apenas avança no wizard.
    router.push(`/eventos/${eventoSlug}/inscricao/atividades`);
  });

  return (
    <Card variant="outlined" component="form" onSubmit={onSubmit} noValidate>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Seus dados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Confirme as informações que vão constar na sua inscrição e no
          certificado.
        </Typography>

        <Stack spacing={3}>
          <TextField
            {...register("nomeCompleto")}
            label="Nome completo"
            required
            fullWidth
            autoComplete="name"
            error={Boolean(errors.nomeCompleto)}
            helperText={errors.nomeCompleto?.message}
            disabled={bloqueado}
          />

          <TextField
            {...register("email")}
            label="E-mail"
            type="email"
            required
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={
              errors.email?.message ??
              "Usado para enviar a confirmação e o recibo."
            }
            disabled={bloqueado}
          />

          <TextField
            {...register("instituicao")}
            label="Instituição"
            fullWidth
            autoComplete="organization"
            error={Boolean(errors.instituicao)}
            helperText={errors.instituicao?.message ?? "Opcional."}
            disabled={bloqueado}
          />

          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Categoria"
                required
                fullWidth
                error={Boolean(errors.categoria)}
                helperText={errors.categoria?.message}
                disabled={bloqueado}
              >
                {CATEGORIAS.map((c) => (
                  <MenuItem key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Box>
            <Controller
              name="aceiteTermos"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={Boolean(field.value)}
                      disabled={bloqueado}
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
              <FormHelperText error sx={{ mx: 1.75 }}>
                {errors.aceiteTermos.message}
              </FormHelperText>
            )}
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button href={`/eventos/${eventoSlug}`} variant="text">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={bloqueado || isSubmitting}
          >
            Continuar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
