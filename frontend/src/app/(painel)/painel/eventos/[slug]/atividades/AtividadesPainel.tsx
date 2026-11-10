"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";

import type { Atividade } from "@/lib/types";

import { inscreverNaAtividade } from "./actions";

/** Fuso fixo: SSR e hidratação precisam gerar o mesmo HTML. */
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

export interface AtividadesPainelProps {
  eventoSlug: string;
  /** Todas as atividades do evento (cronograma). */
  atividades: Atividade[];
  /** Ids das atividades em que o participante já está inscrito. */
  inscritasIds: string[];
  /** A inscrição no evento está confirmada (pré-condição do backend). */
  inscricaoConfirmada: boolean;
}

/**
 * Escolha de atividades dentro do painel do evento (RF05.3, RF05.4): lista a
 * programação, marca o que o participante já cursa e inscreve nas demais. As
 * regras (conflito de horário, lotação, duplicidade) são do backend; a recusa
 * aparece no próprio cartão da atividade.
 */
export default function AtividadesPainel({
  eventoSlug,
  atividades,
  inscritasIds,
  inscricaoConfirmada,
}: AtividadesPainelProps) {
  const router = useRouter();
  const [inscritas, setInscritas] = useState<Set<string>>(
    () => new Set(inscritasIds),
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [emAndamento, setEmAndamento] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  const dias = useMemo(() => {
    const ordenadas = [...atividades].sort((a, b) =>
      a.inicio.localeCompare(b.inicio),
    );
    const grupos = new Map<string, Atividade[]>();
    for (const atividade of ordenadas) {
      const dia = atividade.inicio
        ? diaFmt.format(new Date(atividade.inicio))
        : "Sem data";
      const grupo = grupos.get(dia);
      if (grupo) grupo.push(atividade);
      else grupos.set(dia, [atividade]);
    }
    return [...grupos];
  }, [atividades]);

  function inscrever(id: string) {
    setErros((atual) => ({ ...atual, [id]: "" }));
    setEmAndamento(id);
    iniciar(async () => {
      try {
        const resultado = await inscreverNaAtividade(eventoSlug, id);
        if (resultado.ok) {
          setInscritas((atual) => new Set(atual).add(id));
          router.refresh();
        } else {
          setErros((atual) => ({ ...atual, [id]: resultado.erro }));
        }
      } catch {
        setErros((atual) => ({
          ...atual,
          [id]: "Não foi possível concluir a inscrição nesta atividade.",
        }));
      } finally {
        setEmAndamento(null);
      }
    });
  }

  return (
    <Stack spacing={3}>
      {!inscricaoConfirmada && (
        <Alert severity="warning">
          Sua inscrição no evento ainda não está confirmada. Conclua o pagamento
          para poder escolher atividades.
        </Alert>
      )}

      {dias.map(([dia, doDia]) => (
        <Box key={dia} component="section">
          <Typography
            variant="overline"
            component="h2"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {dia}
          </Typography>

          <Stack spacing={1.5}>
            {doDia.map((atividade) => {
              const inscrita = inscritas.has(atividade.id);
              const erro = erros[atividade.id];
              const ocupada = emAndamento === atividade.id;

              return (
                <Card key={atividade.id} variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: { sm: "flex-start" },
                      }}
                    >
                      <Stack spacing={0.75} sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ flexWrap: "wrap", alignItems: "center" }}
                        >
                          <Typography variant="subtitle1" component="h3">
                            {atividade.titulo}
                          </Typography>
                          {atividade.tipoLabel && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={atividade.tipoLabel}
                            />
                          )}
                        </Stack>

                        {atividade.descricao && (
                          <Typography variant="body2" color="text.secondary">
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
                          {atividade.inicio && atividade.fim && (
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
                              </Typography>
                            </Box>
                          )}
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
                        </Stack>
                      </Stack>

                      {inscrita ? (
                        <Chip
                          color="success"
                          icon={<CheckIcon />}
                          label="Inscrito"
                        />
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() => inscrever(atividade.id)}
                          disabled={!inscricaoConfirmada || emAndamento !== null}
                        >
                          {ocupada ? "Inscrevendo..." : "Inscrever-se"}
                        </Button>
                      )}
                    </Stack>

                    {erro && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {erro}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
