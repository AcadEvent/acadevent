/**
 * ROTA: /eventos/[slug]/inscricao/pagamento
 * OWNER: Igor   RF: RF04.1–4, RF04.9   PRIORIDADE: MVP
 * PROPÓSITO: Passo 3 do fluxo de inscrição (checkout): seleção de lote, aplicação
 *   de cupom e forma de pagamento. Anti-bot com token de uso único por sessão de
 *   checkout + honeypot (CAPTCHA/rate limiting ficam no backend).
 *   Requer autenticação (sessão checada na página).
 * COMPONENTES: Container, PageHeader, Stepper, RadioGroup(lote/pagamento),
 *   TextField(cupom), PagamentoForm (local)
 * DADOS: getEvento(slug), getLotes(slug), getAtividades(slug),
 *   emitirTokenCheckout(), aplicarCupom(), criarInscricao() via Server Action
 *   (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton, em ./loading.tsx) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import {
  emitirTokenCheckout,
  getAtividades,
  getEvento,
  getLotes,
} from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { Atividade, Evento, LoteIngresso } from "@/lib/types";

import { AUTH_ENABLED, BLOQUEIO, PASSOS } from "../wizard";
import PagamentoForm from "./PagamentoForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const evento = await getEvento(slug);
    if (!evento) return { title: "Evento não encontrado" };
    return { title: `Pagamento — ${evento.nome}` };
  } catch {
    return { title: "Inscrição · Pagamento" };
  }
}

export default async function InscricaoPagamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ atividades?: string }>;
}) {
  const { slug } = await params;
  const { atividades: atividadesParam } = await searchParams;

  let evento: Evento | null;
  let lotes: LoteIngresso[];
  let atividades: Atividade[];
  try {
    [evento, lotes, atividades] = await Promise.all([
      getEvento(slug),
      getLotes(slug),
      getAtividades(slug),
    ]);
  } catch {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="error">
          Não foi possível carregar os dados do pagamento. Tente novamente mais
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
          É preciso estar autenticado para concluir a inscrição em {evento.nome}.
        </Alert>
      </Container>
    );
  }

  // A seleção do passo 2 chega pela URL: descarta ids que não existem no evento.
  const idsEscolhidos = new Set(
    (atividadesParam ?? "").split(",").filter(Boolean),
  );
  const escolhidas = atividades.filter((a) => idsEscolhidos.has(a.id));

  const bloqueio =
    evento.inscricao === "abertas" ? null : BLOQUEIO[evento.inscricao];
  const tokenCheckout = await emitirTokenCheckout();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Pagamento"
        subtitle={`${evento.nome}${evento.edicao ? ` · ${evento.edicao}` : ""}`}
        actions={
          <Button href={`/eventos/${evento.slug}`} variant="text">
            Voltar ao evento
          </Button>
        }
      />

      <Stepper
        activeStep={2}
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

      {bloqueio && (
        <Alert
          severity={bloqueio.severidade}
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              href={`/eventos/${evento.slug}`}
            >
              Ver evento
            </Button>
          }
        >
          <AlertTitle>{bloqueio.titulo}</AlertTitle>
          {bloqueio.texto}
        </Alert>
      )}

      <PagamentoForm
        eventoSlug={evento.slug}
        eventoNome={evento.nome}
        lotes={lotes}
        atividades={escolhidas}
        tokenCheckout={tokenCheckout}
        bloqueado={Boolean(bloqueio)}
      />
    </Container>
  );
}
