"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LockIcon from "@mui/icons-material/Lock";
import PixIcon from "@mui/icons-material/Pix";
import ReceiptIcon from "@mui/icons-material/Receipt";

import {
  aplicarCupom,
  calcularDesconto,
  loteDisponivel,
  vagasDoLote,
} from "@/lib/api";
import type {
  Atividade,
  CupomAplicado,
  LoteIngresso,
  MetodoPagamento,
} from "@/lib/types";

import { finalizarInscricao } from "./actions";

/** Mesmo motivo do AtividadesForm: SSR e hidratação precisam do mesmo fuso. */
const TZ = "America/Sao_Paulo";

const dataCurtaFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const moedaFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const METODOS: {
  valor: Exclude<MetodoPagamento, "gratuito">;
  rotulo: string;
  descricao: string;
  icone: React.ReactNode;
}[] = [
  {
    valor: "pix",
    rotulo: "Pix",
    descricao: "Aprovação em poucos minutos.",
    icone: <PixIcon fontSize="small" />,
  },
  {
    valor: "cartao",
    rotulo: "Cartão de crédito",
    descricao: "Pagamento à vista.",
    icone: <CreditCardIcon fontSize="small" />,
  },
  {
    valor: "boleto",
    rotulo: "Boleto bancário",
    descricao: "Compensação em até 3 dias úteis.",
    icone: <ReceiptIcon fontSize="small" />,
  },
];

function precoDe(preco: number): string {
  return preco > 0 ? moedaFmt.format(preco) : "Gratuito";
}

/** Por que um lote não pode ser escolhido agora (RF04.2). */
function motivoIndisponivel(lote: LoteIngresso, agora: Date): string {
  if (vagasDoLote(lote) <= 0) return "Esgotado";
  if (lote.abertura && new Date(lote.abertura) > agora) {
    return `Abre em ${dataCurtaFmt.format(new Date(lote.abertura))}`;
  }
  return "Encerrado";
}

export interface PagamentoFormProps {
  eventoSlug: string;
  eventoNome: string;
  lotes: LoteIngresso[];
  /** Atividades escolhidas no passo 2, já validadas pela página. */
  atividades: Atividade[];
  /** Token de uso único emitido pelo servidor ao abrir o checkout (RF04.9). */
  tokenCheckout: string;
  /** Bloqueia o checkout quando as inscrições não estão abertas (RF01.5.3). */
  bloqueado?: boolean;
}

/**
 * Passo 3 do wizard de inscrição: lote, cupom e forma de pagamento (RF04.1–4,
 * RF04.9). Client Component porque o total reage à escolha do lote e do cupom; a
 * gravação acontece na Server Action `finalizarInscricao`, que revalida tudo.
 */
export default function PagamentoForm({
  eventoSlug,
  eventoNome,
  lotes,
  atividades,
  tokenCheckout,
  bloqueado = false,
}: PagamentoFormProps) {
  const router = useRouter();
  const [enviando, iniciarEnvio] = useTransition();

  // Fixado na montagem: evita que um lote "vire" durante a renderização.
  const [agora] = useState(() => new Date());
  const disponiveis = useMemo(
    () => lotes.filter((l) => loteDisponivel(l, agora)),
    [lotes, agora],
  );

  const [loteId, setLoteId] = useState(disponiveis[0]?.id ?? "");
  const [metodo, setMetodo] = useState<Exclude<MetodoPagamento, "gratuito">>(
    "pix",
  );
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupom, setCupom] = useState<CupomAplicado | null>(null);
  const [erroCupom, setErroCupom] = useState<string | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const lote = disponiveis.find((l) => l.id === loteId) ?? null;
  const subtotal = lote?.preco ?? 0;
  // O desconto acompanha o lote escolhido, sem precisar reaplicar o cupom.
  const desconto = cupom ? calcularDesconto(cupom, subtotal) : 0;
  const total = Math.max(0, subtotal - desconto);
  const gratuito = lote !== null && total === 0;

  const voltarHref = `/eventos/${eventoSlug}/inscricao/atividades`;

  async function onAplicarCupom() {
    if (!codigoCupom.trim() || !lote) return;
    setValidandoCupom(true);
    setErroCupom(null);
    try {
      const resultado = await aplicarCupom(eventoSlug, codigoCupom, lote.preco);
      if (resultado.ok) {
        setCupom(resultado.cupom);
        setCodigoCupom("");
      } else {
        setErroCupom(resultado.erro);
      }
    } catch {
      setErroCupom("Não foi possível validar o cupom agora.");
    } finally {
      setValidandoCupom(false);
    }
  }

  function onConfirmar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!lote) return;
    setErro(null);

    iniciarEnvio(async () => {
      try {
        const resultado = await finalizarInscricao(
          {
            eventoSlug,
            loteId: lote.id,
            atividadesIds: atividades.map((a) => a.id),
            cupom: cupom?.codigo,
            metodoPagamento: gratuito ? "gratuito" : metodo,
            tokenCheckout,
          },
          honeypot,
        );
        if (!resultado.ok) {
          setErro(resultado.erro);
          return;
        }
        router.push(
          `/eventos/${eventoSlug}/inscricao/confirmacao?inscricao=${resultado.inscricao.id}`,
        );
      } catch {
        setErro("Não foi possível concluir a inscrição. Tente novamente.");
      }
    });
  }

  return (
    <Box component="form" onSubmit={onConfirmar} noValidate>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {/* Lote de ingresso (RF04.2) */}
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Ingresso
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Escolha o lote. O preço vale para quem conclui a inscrição
                  dentro do período do lote.
                </Typography>

                {lotes.length === 0 ? (
                  <Alert severity="info">
                    Este evento ainda não tem lotes de ingresso cadastrados.
                  </Alert>
                ) : (
                  <RadioGroup
                    value={loteId}
                    onChange={(e) => setLoteId(e.target.value)}
                    aria-label="Lote de ingresso"
                  >
                    <Stack spacing={1.5}>
                      {lotes.map((l) => {
                        const aberto = disponiveis.includes(l);
                        const marcado = l.id === loteId;
                        return (
                          <Box
                            key={l.id}
                            sx={{
                              border: 1,
                              borderRadius: 1,
                              borderColor: marcado ? "primary.main" : "divider",
                              opacity: aberto ? 1 : 0.6,
                              px: 2,
                              py: 1,
                            }}
                          >
                            <FormControlLabel
                              value={l.id}
                              disabled={bloqueado || !aberto}
                              control={<Radio />}
                              sx={{
                                m: 0,
                                width: "100%",
                                "& .MuiFormControlLabel-label": { flex: 1 },
                              }}
                              label={
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {l.nome}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {aberto
                                        ? `${vagasDoLote(l)} vagas${l.encerramento ? ` · até ${dataCurtaFmt.format(new Date(l.encerramento))}` : ""}`
                                        : motivoIndisponivel(l, agora)}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="subtitle1"
                                    component="span"
                                    color={aberto ? "primary.main" : "text.secondary"}
                                    sx={{ whiteSpace: "nowrap" }}
                                  >
                                    {precoDe(l.preco)}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                )}

                {lotes.length > 0 && disponiveis.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Nenhum lote está disponível no momento.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Cupom de desconto (RF04.3) */}
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Cupom de desconto
                </Typography>

                {cupom ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
                  >
                    <Chip
                      icon={<LocalOfferIcon />}
                      color="success"
                      label={cupom.codigo}
                      onDelete={bloqueado || enviando ? undefined : () => setCupom(null)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {cupom.tipo === "percentual"
                        ? `${cupom.valor}% de desconto`
                        : `${moedaFmt.format(cupom.valor)} de desconto`}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ alignItems: { sm: "flex-start" } }}
                  >
                    <TextField
                      label="Código do cupom"
                      size="small"
                      fullWidth
                      value={codigoCupom}
                      onChange={(e) => {
                        setCodigoCupom(e.target.value.toUpperCase());
                        setErroCupom(null);
                      }}
                      onKeyDown={(e) => {
                        // Enter aplica o cupom em vez de enviar o checkout.
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onAplicarCupom();
                        }
                      }}
                      error={Boolean(erroCupom)}
                      helperText={erroCupom ?? "Opcional."}
                      disabled={bloqueado || !lote}
                      slotProps={{ htmlInput: { maxLength: 50 } }}
                    />
                    <Button
                      variant="outlined"
                      onClick={onAplicarCupom}
                      disabled={
                        bloqueado || !lote || !codigoCupom.trim() || validandoCupom
                      }
                      sx={{ flexShrink: 0, height: 40 }}
                    >
                      {validandoCupom ? "Validando…" : "Aplicar"}
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Forma de pagamento (RF04.4) */}
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Pagamento
                </Typography>

                {gratuito ? (
                  <Alert severity="success" icon={<CheckIcon />}>
                    Nada a pagar: sua inscrição é confirmada assim que você
                    concluir.
                  </Alert>
                ) : (
                  <RadioGroup
                    value={metodo}
                    onChange={(e) =>
                      setMetodo(e.target.value as typeof metodo)
                    }
                    aria-label="Forma de pagamento"
                  >
                    {METODOS.map((m) => (
                      <FormControlLabel
                        key={m.valor}
                        value={m.valor}
                        disabled={bloqueado || !lote}
                        control={<Radio />}
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", py: 0.5 }}
                          >
                            <Box sx={{ display: "flex", color: "text.secondary" }}>
                              {m.icone}
                            </Box>
                            <Box>
                              <Typography variant="body2">{m.rotulo}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {m.descricao}
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    ))}
                  </RadioGroup>
                )}

                {/*
                 * Honeypot anti-bot (RF04.9): fora da tela e fora da ordem de
                 * tabulação, então só um robô preenchendo tudo o encontra.
                 * TODO(api): somar CAPTCHA e rate limiting no backend.
                 */}
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    left: "-10000px",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                  }}
                >
                  <label>
                    Site
                    <input
                      type="text"
                      name="site"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Resumo do pedido */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            sx={{ position: { md: "sticky" }, top: { md: 24 } }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                  color: "text.secondary",
                }}
              >
                <ConfirmationNumberIcon fontSize="small" />
                <Typography variant="overline">Resumo</Typography>
              </Box>

              <Typography variant="subtitle1" component="h2" gutterBottom>
                {eventoNome}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {atividades.length === 0
                  ? "Nenhuma atividade selecionada."
                  : `${atividades.length} ${atividades.length === 1 ? "atividade" : "atividades"}:`}
              </Typography>
              {atividades.length > 0 && (
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
                  {atividades.map((a) => (
                    <Typography
                      key={a.id}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      {a.titulo}
                    </Typography>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    {lote ? lote.nome : "Ingresso"}
                  </Typography>
                  <Typography variant="body2">
                    {lote ? moedaFmt.format(subtotal) : "—"}
                  </Typography>
                </Stack>
                {cupom && (
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="success.main">
                      Cupom {cupom.codigo}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      − {moedaFmt.format(desconto)}
                    </Typography>
                  </Stack>
                )}
                <Divider />
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "baseline" }}
                >
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="h5" component="p" color="primary.main">
                    {lote ? precoDe(total) : "—"}
                  </Typography>
                </Stack>
              </Stack>

              {erro && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {erro}
                </Alert>
              )}

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<LockIcon />}
                  disabled={bloqueado || !lote || enviando}
                >
                  {enviando
                    ? "Processando…"
                    : gratuito
                      ? "Concluir inscrição"
                      : "Confirmar e pagar"}
                </Button>
                <Button href={voltarHref} variant="text" fullWidth disabled={enviando}>
                  Voltar
                </Button>
              </Stack>

              {!gratuito && lote && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 2 }}
                >
                  A inscrição fica pendente até a confirmação do pagamento. O
                  recibo é liberado assim que ele for confirmado.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
