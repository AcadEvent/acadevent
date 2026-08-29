"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";

import type { Atividade, Ministrante, TipoAtividade } from "@/lib/types";

const TIPO_LABEL: Record<TipoAtividade, string> = {
  palestra: "Palestra",
  minicurso: "Minicurso",
  mesa_redonda: "Mesa-redonda",
  workshop: "Workshop",
  mostra: "Mostra",
  maratona: "Maratona",
  outro: "Outro",
};

/**
 * O fuso é fixado para que o HTML renderizado no servidor e o da hidratação no
 * navegador sejam idênticos (este é um Client Component). Os horários das
 * atividades são sempre os do local do evento.
 */
const TZ = "America/Sao_Paulo";

const diaFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: TZ,
});

const horaFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const horasFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** Vagas ainda disponíveis; `undefined` quando a atividade não controla vagas. */
function vagasDe(atividade: Atividade): number | undefined {
  return atividade.vagasRestantes ?? atividade.capacidade;
}

/** Capacidade máxima atingida — a atividade não aceita mais inscritos (RF05.3). */
function esgotada(atividade: Atividade): boolean {
  const vagas = vagasDe(atividade);
  return vagas !== undefined && vagas <= 0;
}

/**
 * Sobreposição de horários entre duas atividades (RF05.4). Encostar não é
 * conflito: uma que termina 10:30 e outra que começa 10:30 convivem.
 */
function sobrepoe(a: Atividade, b: Atividade): boolean {
  return (
    new Date(a.inicio) < new Date(b.fim) && new Date(b.inicio) < new Date(a.fim)
  );
}

export interface AtividadesFormProps {
  eventoSlug: string;
  atividades: Atividade[];
  ministrantes: Ministrante[];
  /** Bloqueia a seleção quando as inscrições não estão abertas (RF01.5.3). */
  bloqueado?: boolean;
}

/**
 * Passo 2 do wizard de inscrição: seleção de atividades (RF05.3, RF05.4). Client
 * Component porque a seleção e a detecção de conflito são interativas; os dados
 * vêm resolvidos do Server Component da página (ver page.tsx).
 */
export default function AtividadesForm({
  eventoSlug,
  atividades,
  ministrantes,
  bloqueado = false,
}: AtividadesFormProps) {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  const nomePorMinistrante = useMemo(
    () => new Map(ministrantes.map((m) => [m.id, m.nome])),
    [ministrantes],
  );

  /** Atividades em ordem cronológica, agrupadas pelo dia em que acontecem. */
  const dias = useMemo(() => {
    const ordenadas = [...atividades].sort((a, b) =>
      a.inicio.localeCompare(b.inicio),
    );
    const grupos = new Map<string, Atividade[]>();
    for (const atividade of ordenadas) {
      const dia = diaFmt.format(new Date(atividade.inicio));
      const grupo = grupos.get(dia);
      if (grupo) grupo.push(atividade);
      else grupos.set(dia, [atividade]);
    }
    return [...grupos];
  }, [atividades]);

  const escolhidas = useMemo(
    () => atividades.filter((a) => selecionadas.includes(a.id)),
    [atividades, selecionadas],
  );

  /** Pares de atividades escolhidas que se sobrepõem no tempo (RF05.4). */
  const conflitos = useMemo(() => {
    const pares: [Atividade, Atividade][] = [];
    for (let i = 0; i < escolhidas.length; i += 1) {
      for (let j = i + 1; j < escolhidas.length; j += 1) {
        if (sobrepoe(escolhidas[i], escolhidas[j])) {
          pares.push([escolhidas[i], escolhidas[j]]);
        }
      }
    }
    return pares;
  }, [escolhidas]);

  const idsEmConflito = useMemo(
    () => new Set(conflitos.flatMap(([a, b]) => [a.id, b.id])),
    [conflitos],
  );

  const cargaHoraria = escolhidas.reduce(
    (total, a) => total + (a.cargaHoraria ?? 0),
    0,
  );

  function alternar(id: string) {
    setSelecionadas((atual) =>
      atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id],
    );
  }

  function avancar() {
    // TODO(api): persistir a seleção (inscreverEmAtividades) quando a API NestJS
    // existir; por ora a escolha viaja na URL para o passo de pagamento.
    const query = selecionadas.length
      ? `?atividades=${selecionadas.join(",")}`
      : "";
    router.push(`/eventos/${eventoSlug}/inscricao/pagamento${query}`);
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Escolha suas atividades
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Marque as atividades que você quer cursar. A seleção não é obrigatória
          para concluir a inscrição no evento.
        </Typography>

        {conflitos.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Conflito de horário</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Estas atividades acontecem ao mesmo tempo. Desmarque uma de cada
              par para continuar:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {conflitos.map(([a, b]) => (
                <Typography
                  component="li"
                  variant="body2"
                  key={`${a.id}-${b.id}`}
                >
                  {a.titulo} × {b.titulo}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}

        <Stack spacing={3}>
          {dias.map(([dia, doDia]) => (
            <Box key={dia} component="section">
              <Typography
                variant="overline"
                component="h3"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {dia}
              </Typography>

              <Stack spacing={1.5}>
                {doDia.map((atividade) => {
                  const vagas = vagasDe(atividade);
                  const lotada = esgotada(atividade);
                  const marcada = selecionadas.includes(atividade.id);
                  const conflitante = idsEmConflito.has(atividade.id);
                  const nomes = (atividade.ministrantesIds ?? [])
                    .map((id) => nomePorMinistrante.get(id))
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <Box
                      key={atividade.id}
                      sx={{
                        border: 1,
                        borderRadius: 1,
                        borderColor: conflitante ? "warning.main" : "divider",
                        bgcolor: conflitante
                          ? (theme) => alpha(theme.palette.warning.main, 0.08)
                          : "transparent",
                        opacity: lotada && !marcada ? 0.6 : 1,
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <FormControlLabel
                        sx={{
                          alignItems: "flex-start",
                          m: 0,
                          width: "100%",
                          "& .MuiFormControlLabel-label": { width: "100%" },
                        }}
                        control={
                          <Checkbox
                            checked={marcada}
                            onChange={() => alternar(atividade.id)}
                            disabled={bloqueado || (lotada && !marcada)}
                            sx={{ mt: -0.75, mr: 1 }}
                            slotProps={{
                              input: {
                                "aria-label": `Selecionar ${atividade.titulo}`,
                              },
                            }}
                          />
                        }
                        label={
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap", alignItems: "center" }}
                            >
                              <Typography variant="subtitle2" component="span">
                                {atividade.titulo}
                              </Typography>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={TIPO_LABEL[atividade.tipo]}
                              />
                              {lotada && (
                                <Chip
                                  size="small"
                                  color="error"
                                  label="Esgotada"
                                />
                              )}
                            </Stack>

                            {atividade.descricao && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {atividade.descricao}
                              </Typography>
                            )}

                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{
                                flexWrap: "wrap",
                                rowGap: 0.5,
                                color: "text.secondary",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <ScheduleIcon fontSize="small" />
                                <Typography variant="caption">
                                  {horaFmt.format(new Date(atividade.inicio))} –{" "}
                                  {horaFmt.format(new Date(atividade.fim))}
                                  {atividade.cargaHoraria
                                    ? ` · ${horasFmt.format(atividade.cargaHoraria)} h`
                                    : ""}
                                </Typography>
                              </Box>

                              {atividade.local && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <PlaceIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {atividade.local}
                                  </Typography>
                                </Box>
                              )}

                              {nomes && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <PersonIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {nomes}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            {vagas !== undefined && (
                              <Typography
                                variant="caption"
                                color={lotada ? "error.main" : "text.secondary"}
                              >
                                {lotada
                                  ? "Sem vagas disponíveis."
                                  : `${vagas} vagas restantes.`}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="body2" color="text.secondary">
            {escolhidas.length === 0
              ? "Nenhuma atividade selecionada. Dá para seguir assim e escolher depois, enquanto houver vagas."
              : `${escolhidas.length} ${escolhidas.length === 1 ? "atividade selecionada" : "atividades selecionadas"} · ${horasFmt.format(cargaHoraria)} h no total.`}
          </Typography>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button href={`/eventos/${eventoSlug}/inscricao`} variant="text">
              Voltar
            </Button>
            <Button
              onClick={avancar}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              disabled={bloqueado || conflitos.length > 0}
            >
              Continuar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
