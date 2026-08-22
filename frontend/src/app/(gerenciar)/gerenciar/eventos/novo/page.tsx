/**
 * ROTA: /gerenciar/eventos/novo
 * OWNER: Arthur   RF: RF01.1.1–5   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de novo evento (dados cadastrais e identidade visual).
 * COMPONENTES: TextField, DatePicker, upload (react-hook-form + zod)
 * DADOS: postEvento() (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import PageHeader from "@/components/layout/PageHeader";
import { postEvento } from "@/lib/api";
import type { Evento } from "@/lib/types";

const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024;
const TIPOS_IMAGEM = new Set([
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

const imagemSchema = z
  .instanceof(File, { message: "Selecione um arquivo válido." })
  .refine(
    (arquivo) => TIPOS_IMAGEM.has(arquivo.type),
    "Use uma imagem JPG, PNG, SVG ou WebP.",
  )
  .refine(
    (arquivo) => arquivo.size <= TAMANHO_MAX_IMAGEM,
    "O arquivo deve ter no máximo 5 MB.",
  );

const novoEventoSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, "Informe o nome completo do evento.")
      .max(255, "Use no máximo 255 caracteres."),
    sigla: z
      .string()
      .trim()
      .min(2, "Informe uma sigla com pelo menos 2 caracteres.")
      .max(50, "Use no máximo 50 caracteres."),
    edicao: z
      .string()
      .trim()
      .min(1, "Informe o número ou ano da edição.")
      .max(50, "Use no máximo 50 caracteres."),
    descricao: z
      .string()
      .trim()
      .max(2000, "Use no máximo 2.000 caracteres."),
    areaTematica: z
      .string()
      .trim()
      .max(150, "Use no máximo 150 caracteres."),
    publicoAlvo: z
      .string()
      .trim()
      .max(255, "Use no máximo 255 caracteres."),
    instituicao: z
      .string()
      .trim()
      .min(2, "Informe a instituição ou unidade promotora.")
      .max(255, "Use no máximo 255 caracteres."),
    local: z.string().trim().min(3, "Informe o local de realização."),
    inicio: z.string().min(1, "Informe a data de início."),
    fim: z.string().min(1, "Informe a data de encerramento."),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
  })
  .refine(
    ({ inicio, fim }) =>
      !inicio || !fim || !dayjs(fim).isBefore(dayjs(inicio), "day"),
    {
      message: "A data final deve ser igual ou posterior à data inicial.",
      path: ["fim"],
    },
  );

type NovoEventoFormData = z.infer<typeof novoEventoSchema>;

const VALORES_INICIAIS: NovoEventoFormData = {
  nome: "",
  sigla: "",
  edicao: "",
  instituicao: "",
  descricao: "",
  areaTematica: "",
  publicoAlvo: "",
  inicio: "",
  fim: "",
  local: "",
  logoUrl: undefined,
  bannerUrl: undefined,
};

function valorOpcional(valor: string): string | undefined {
  return valor || undefined;
}

function arquivoParaDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        resolve(leitor.result);
        return;
      }

      reject(new Error("Resultado inválido ao ler a imagem."));
    };
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(arquivo);
  });
}

async function processarImagem(arquivo?: File): Promise<{
  dataUrl?: string;
  nome?: string;
  erro?: string;
}> {
  if (!arquivo) {
    return {};
  }

  const validacao = imagemSchema.safeParse(arquivo);

  if (!validacao.success) {
    return { erro: validacao.error.issues[0]?.message };
  }

  try {
    return {
      dataUrl: await arquivoParaDataUrl(arquivo),
      nome: arquivo.name,
    };
  } catch {
    return { erro: "Não foi possível ler o arquivo selecionado." };
  }
}

export default function NovoEventoPage() {
  const router = useRouter();
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [nomeLogo, setNomeLogo] = useState<string | null>(null);
  const [nomeBanner, setNomeBanner] = useState<string | null>(null);
  const {
    clearErrors,
    control,
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NovoEventoFormData>({
    resolver: zodResolver(novoEventoSchema),
    defaultValues: VALORES_INICIAIS,
    mode: "onBlur",
  });
  const inicio = useWatch({ control, name: "inicio" });

  const onSubmit = handleSubmit(async (dados) => {
    setErroEnvio(null);

    const payload: Omit<Evento, "slug" | "status" | "inscricao"> = {
      nome: dados.nome,
      sigla: dados.sigla,
      edicao: dados.edicao,
      instituicao: dados.instituicao,
      descricao: valorOpcional(dados.descricao),
      areaTematica: valorOpcional(dados.areaTematica),
      publicoAlvo: valorOpcional(dados.publicoAlvo),
      local: dados.local,
      logoUrl: dados.logoUrl,
      bannerUrl: dados.bannerUrl,
      inicio: dayjs(dados.inicio).startOf("day").toISOString(),
      fim: dayjs(dados.fim).endOf("day").toISOString(),
    };

    try {
      const evento = await postEvento(payload);
      router.push(`/gerenciar/${evento.slug}`);
    } catch {
      setErroEnvio(
        "Não foi possível criar o evento. Revise os dados e tente novamente.",
      );
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth="md" disableGutters>
        <PageHeader
          title="Novo evento"
          subtitle="Cadastre as informações iniciais. O evento será criado como rascunho."
        />

        {erroEnvio && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erroEnvio}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" component="h2">
                Identificação
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Dados usados para identificar a edição nas páginas públicas.
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register("nome")}
                    label="Nome completo do evento"
                    placeholder="Ex.: Simpósio de Inovação em Tecnologia"
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.nome)}
                    helperText={errors.nome?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register("sigla")}
                    label="Sigla"
                    placeholder="Ex.: SIT"
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.sigla)}
                    helperText={errors.sigla?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register("edicao")}
                    label="Edição"
                    placeholder="Ex.: 2026 ou 5ª"
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.edicao)}
                    helperText={errors.edicao?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    {...register("areaTematica")}
                    label="Área temática"
                    placeholder="Ex.: Computação"
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.areaTematica)}
                    helperText={errors.areaTematica?.message ?? "Opcional"}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register("instituicao")}
                    label="Instituição ou unidade promotora"
                    placeholder="Nome, campus, departamento ou curso"
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.instituicao)}
                    helperText={errors.instituicao?.message}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" component="h2">
                Apresentação
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Conte ao público qual é a proposta do evento.
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Stack spacing={2.5}>
                <TextField
                  {...register("descricao")}
                  label="Descrição geral"
                  placeholder="Apresente os objetivos e os principais temas do evento"
                  multiline
                  minRows={4}
                  fullWidth
                  disabled={isSubmitting}
                  error={Boolean(errors.descricao)}
                  helperText={errors.descricao?.message ?? "Opcional"}
                />
                <TextField
                  {...register("publicoAlvo")}
                  label="Público-alvo"
                  placeholder="Ex.: estudantes, docentes e profissionais da área"
                  fullWidth
                  disabled={isSubmitting}
                  error={Boolean(errors.publicoAlvo)}
                  helperText={errors.publicoAlvo?.message ?? "Opcional"}
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" component="h2">
                Período e local
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Informe quando e onde esta edição será realizada.
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="inicio"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DatePicker
                        label="Data de início"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(data) =>
                          field.onChange(
                            data?.isValid() ? data.format("YYYY-MM-DD") : "",
                          )
                        }
                        disabled={isSubmitting}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            onBlur: field.onBlur,
                            inputRef: field.ref,
                            error: Boolean(fieldState.error),
                            helperText: fieldState.error?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="fim"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DatePicker
                        label="Data de encerramento"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(data) =>
                          field.onChange(
                            data?.isValid() ? data.format("YYYY-MM-DD") : "",
                          )
                        }
                        minDate={inicio ? dayjs(inicio) : undefined}
                        disabled={isSubmitting}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            onBlur: field.onBlur,
                            inputRef: field.ref,
                            error: Boolean(fieldState.error),
                            helperText: fieldState.error?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    {...register("local")}
                    label="Local de realização"
                    placeholder="Endereço, campus, cidade e estado"
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={Boolean(errors.local)}
                    helperText={errors.local?.message}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" component="h2">
                Identidade visual
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Adicione o logotipo e o banner que representarão esta edição.
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Controller
                name="logoUrl"
                control={control}
                render={({ field: { onChange, ref }, fieldState }) => (
                  <Box>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={isSubmitting}
                      >
                        Selecionar logotipo
                        <Box
                          component="input"
                          ref={ref}
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml,image/webp"
                          onChange={async (event) => {
                            const resultado = await processarImagem(
                              event.target.files?.[0],
                            );

                            if (resultado.erro) {
                              onChange(undefined);
                              setNomeLogo(null);
                              setError("logoUrl", {
                                type: "validate",
                                message: resultado.erro,
                              });
                              return;
                            }

                            onChange(resultado.dataUrl);
                            setNomeLogo(resultado.nome ?? null);
                            clearErrors("logoUrl");
                          }}
                          sx={{ display: "none" }}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {nomeLogo ?? "Nenhum arquivo selecionado"}
                      </Typography>
                    </Stack>
                    <FormHelperText error={Boolean(fieldState.error)}>
                      {fieldState.error?.message ??
                        "JPG, PNG, SVG ou WebP, com até 5 MB. Campo opcional."}
                    </FormHelperText>
                  </Box>
                )}
              />

              <Divider sx={{ my: 3 }} />

              <Controller
                name="bannerUrl"
                control={control}
                render={({ field: { onChange, ref }, fieldState }) => (
                  <Box>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={isSubmitting}
                      >
                        Selecionar banner
                        <Box
                          component="input"
                          ref={ref}
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml,image/webp"
                          onChange={async (event) => {
                            const resultado = await processarImagem(
                              event.target.files?.[0],
                            );

                            if (resultado.erro) {
                              onChange(undefined);
                              setNomeBanner(null);
                              setError("bannerUrl", {
                                type: "validate",
                                message: resultado.erro,
                              });
                              return;
                            }

                            onChange(resultado.dataUrl);
                            setNomeBanner(resultado.nome ?? null);
                            clearErrors("bannerUrl");
                          }}
                          sx={{ display: "none" }}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {nomeBanner ?? "Nenhum arquivo selecionado"}
                      </Typography>
                    </Stack>
                    <FormHelperText error={Boolean(fieldState.error)}>
                      {fieldState.error?.message ??
                        "JPG, PNG, SVG ou WebP, com até 5 MB. Campo opcional."}
                    </FormHelperText>
                  </Box>
                )}
              />
            </Paper>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "flex-end", pb: 2 }}
            >
              <Button
                href="/gerenciar/eventos"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                {isSubmitting ? "Criando evento…" : "Criar evento"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}
