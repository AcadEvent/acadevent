/**
 * ROTA: /eventos/[slug]/inscricao/confirmacao
 * OWNER: Igor   RF: RF04.4, RF04.6, RF09.1   PRIORIDADE: MVP
 * PROPÓSITO: Passo 4 do fluxo de inscrição: confirmação da inscrição, status do
 *   pagamento e recibo (liberado só com o pagamento confirmado — RF04.6).
 *   Recebe `?inscricao=<id>` do passo de pagamento.
 * COMPONENTES: Container, PageHeader, Stepper, Alert(status), Card(recibo),
 *   ImprimirReciboButton (local)
 * DADOS: getInscricao(id), getEvento(slug), getAtividades(slug)
 *   (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton, em ./loading.tsx) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { getAtividades, getEvento, getInscricao } from "@/lib/api";
import type {
  Atividade,
  Evento,
  InscricaoEdicao,
  MetodoPagamento,
  StatusPagamento,
} from "@/lib/types";

import { PASSOS } from "../wizard";
import ImprimirReciboButton from "./ImprimirReciboButton";

/** Horários sempre no fuso do evento, independente do fuso do servidor. */
const TZ = "America/Sao_Paulo";

const dataHoraFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const moedaFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const METODO_LABEL: Record<MetodoPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  boleto: "Boleto bancário",
  gratuito: "Isento",
};

const STATUS: Record<
  StatusPagamento,
  {
    rotulo: string;
    cor: "success" | "warning" | "error" | "default";
    severidade: "success" | "info" | "error";
    titulo: string;
  }
> = {
  confirmado: {
    rotulo: "Confirmada",
    cor: "success",
    severidade: "success",
    titulo: "Inscrição confirmada!",
  },
  pendente: {
    rotulo: "Pagamento pendente",
    cor: "warning",
    severidade: "info",
    titulo: "Inscrição registrada — aguardando pagamento",
  },
  cancelado: {
    rotulo: "Cancelada",
    cor: "error",
    severidade: "error",
    titulo: "Inscrição cancelada",
  },
  estornado: {
    rotulo: "Estornada",
    cor: "default",
    severidade: "error",
    titulo: "Pagamento estornado",
  },
};

/** Texto do aviso de status, conforme a situação e a forma de pagamento. */
function mensagemStatus(inscricao: InscricaoEdicao): string {
  switch (inscricao.statusPagamento) {
    case "confirmado":
      return "Enviamos a confirmação para o seu e-mail. O recibo já está disponível abaixo.";
    case "pendente":
      if (inscricao.metodoPagamento === "boleto") {
        return "O boleto foi enviado para o seu e-mail. A compensação leva até 3 dias úteis; o recibo é liberado quando o pagamento for confirmado.";
      }
      return "Assim que o pagamento for confirmado, você recebe um e-mail e o recibo é liberado aqui e no seu painel.";
    case "cancelado":
      return "Esta inscrição foi cancelada. Se isso foi um engano, fale com a organização do evento.";
    case "estornado":
      return "O valor desta inscrição foi devolvido e ela não está mais ativa.";
  }
}

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: "baseline" }}
    >
      <Typography
        variant={destaque ? "subtitle1" : "body2"}
        color={destaque ? "text.primary" : "text.secondary"}
      >
        {rotulo}
      </Typography>
      <Typography
        variant={destaque ? "h6" : "body2"}
        component="span"
        sx={{ textAlign: "right" }}
      >
        {valor}
      </Typography>
    </Stack>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const evento = await getEvento(slug);
    if (!evento) return { title: "Evento não encontrado" };
    return { title: `Inscrição confirmada — ${evento.nome}` };
  } catch {
    return { title: "Inscrição · Confirmação" };
  }
}

export default async function InscricaoConfirmacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ inscricao?: string }>;
}) {
  const { slug } = await params;
  const { inscricao: inscricaoId } = await searchParams;

  let evento: Evento | null;
  let inscricao: InscricaoEdicao | null;
  let atividades: Atividade[];
  try {
    [evento, inscricao, atividades] = await Promise.all([
      getEvento(slug),
      inscricaoId ? getInscricao(inscricaoId) : Promise.resolve(null),
      getAtividades(slug),
    ]);
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar os dados da inscrição. Tente novamente mais
          tarde.
        </Alert>
      </Container>
    );
  }

  if (!evento) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <EmptyState
          title="Evento não encontrado"
          description="O evento que você procura não existe ou não está mais publicado."
          action={
            <Button href="/eventos" variant="contained">
              Ver todos os eventos
            </Button>
          }
        />
      </Container>
    );
  }

  // Um id de outro evento na URL é tratado como inexistente.
  if (!inscricao || inscricao.eventoSlug !== evento.slug) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <EmptyState
          title="Inscrição não encontrada"
          description="Não localizamos esta inscrição. Suas inscrições ficam sempre disponíveis no painel."
          icon={<ReceiptLongIcon sx={{ fontSize: 48 }} />}
          action={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button href="/painel" variant="contained">
                Ir para o painel
              </Button>
              <Button href={`/eventos/${evento.slug}/inscricao`} variant="text">
                Fazer inscrição
              </Button>
            </Stack>
          }
        />
      </Container>
    );
  }

  const status = STATUS[inscricao.statusPagamento];
  const confirmada = inscricao.statusPagamento === "confirmado";
  const ids = new Set(inscricao.atividadesIds ?? []);
  const escolhidas = atividades.filter((a) => ids.has(a.id));
  const valorBruto = inscricao.valorBruto ?? inscricao.valor;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ displayPrint: "none" }}>
        <PageHeader
          title="Confirmação"
          subtitle={`${evento.nome}${evento.edicao ? ` · ${evento.edicao}` : ""}`}
          actions={
            <Button href={`/eventos/${evento.slug}`} variant="text">
              Voltar ao evento
            </Button>
          }
        />

        <Stepper
          // Confirmada = todos os passos concluídos; pendente = parado no último.
          activeStep={confirmada ? PASSOS.length : PASSOS.length - 1}
          alternativeLabel
          sx={{
            mb: { xs: 3, md: 5 },
            "& .MuiStepLabel-label": {
              typography: { xs: "caption", sm: "body2" },
            },
          }}
        >
          {PASSOS.map((passo) => (
            <Step key={passo}>
              <StepLabel>{passo}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Alert severity={status.severidade} sx={{ displayPrint: "none" }}>
              <AlertTitle>{status.titulo}</AlertTitle>
              {mensagemStatus(inscricao)}
            </Alert>

            {/* Recibo / comprovante (RF04.6) */}
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {confirmada ? "Recibo" : "Comprovante de inscrição"}
                    </Typography>
                    <Typography variant="h6" component="h2">
                      {inscricao.codigo ?? inscricao.id}
                    </Typography>
                  </Box>
                  <Chip size="small" color={status.cor} label={status.rotulo} />
                </Stack>

                <Stack spacing={1}>
                  <Linha rotulo="Participante" valor={inscricao.participante} />
                  <Linha rotulo="Evento" valor={evento.nome} />
                  <Linha
                    rotulo="Inscrição em"
                    valor={dataHoraFmt.format(new Date(inscricao.criadaEm))}
                  />
                  {inscricao.pagaEm && (
                    <Linha
                      rotulo="Pagamento confirmado em"
                      valor={dataHoraFmt.format(new Date(inscricao.pagaEm))}
                    />
                  )}
                  {inscricao.metodoPagamento && (
                    <Linha
                      rotulo="Forma de pagamento"
                      valor={METODO_LABEL[inscricao.metodoPagamento]}
                    />
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Linha
                    rotulo={inscricao.loteNome ?? "Ingresso"}
                    valor={moedaFmt.format(valorBruto)}
                  />
                  {inscricao.cupom && (
                    <Linha
                      rotulo={`Cupom ${inscricao.cupom.codigo}`}
                      valor={`− ${moedaFmt.format(inscricao.cupom.desconto)}`}
                    />
                  )}
                  <Divider />
                  <Linha
                    rotulo={confirmada ? "Total pago" : "Total a pagar"}
                    valor={moedaFmt.format(inscricao.valor)}
                    destaque
                  />
                </Stack>

                {escolhidas.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Atividades
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {escolhidas.map((a) => (
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
                  </>
                )}

                <Box sx={{ mt: 3, displayPrint: "none" }}>
                  {confirmada ? (
                    <ImprimirReciboButton />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      O recibo fica disponível após a confirmação do pagamento.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Próximos passos */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ displayPrint: "none" }}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="subtitle1" component="h2" gutterBottom>
                Próximos passos
              </Typography>
              <Box component="ul" sx={{ m: 0, mb: 2, pl: 2.5 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Acompanhe suas inscrições, recibos e certificados no painel.
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Você ainda pode ajustar suas atividades enquanto houver vagas.
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  No dia do evento, apresente o QR Code do painel no
                  credenciamento.
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                <Button href="/painel" variant="contained" fullWidth>
                  Ir para o painel
                </Button>
                <Button
                  href={`/eventos/${evento.slug}`}
                  variant="outlined"
                  fullWidth
                >
                  Ver página do evento
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
