/**
 * ROTA: /painel/eventos/[slug]/atividades
 * RF: RF05.3, RF05.4, RF03.1.6   PRIORIDADE: MVP
 * PROPÓSITO: Escolher e acompanhar as atividades do evento dentro do painel
 *   pessoal: mostra a programação, marca as atividades em que o participante já
 *   está inscrito e permite inscrever-se nas demais (conflito de horário,
 *   lotação e duplicidade são validados pelo backend).
 * DADOS: getPainelEvento(slug, token) e getCronograma(idEdicao)
 *   (via src/lib/api — nunca fetch direto)
 * ESTADOS: não participa (EmptyState) / erro (Alert) / sem atividades (EmptyState)
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import EventNoteIcon from "@mui/icons-material/EventNote";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getCronograma, getPainelEvento } from "@/lib/api";
import { getToken } from "@/lib/auth/session";
import type { Atividade, PainelEvento } from "@/lib/types";

import AtividadesPainel from "./AtividadesPainel";

export const metadata: Metadata = { title: "Atividades do evento" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: PainelEvento | null;
  let atividades: Atividade[] = [];
  try {
    const token = await getToken();
    evento = token ? await getPainelEvento(slug, token) : null;
    if (evento?.idEdicao) atividades = await getCronograma(evento.idEdicao);
  } catch {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <PageHeader title="Atividades" />
        <Alert severity="error">
          Não foi possível carregar as atividades agora. Tente novamente em
          instantes.
        </Alert>
      </Box>
    );
  }

  if (!evento) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <EmptyState
          title="Evento não encontrado"
          description="Este evento não existe ou você não participa dele."
          action={
            <Button href="/painel" variant="contained">
              Voltar ao meu painel
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/painel" underline="hover" color="inherit">
          Meu painel
        </Link>
        <Link
          href={`/painel/eventos/${evento.slug}`}
          underline="hover"
          color="inherit"
        >
          {evento.sigla ?? evento.nome}
        </Link>
        <Typography color="text.primary">Atividades</Typography>
      </Breadcrumbs>

      <PageHeader
        title="Atividades"
        subtitle={`${evento.nome} · ${evento.atividadesInscritas} ${
          evento.atividadesInscritas === 1
            ? "atividade inscrita"
            : "atividades inscritas"
        }`}
      />

      {atividades.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade publicada"
          description="A programação deste evento ainda não foi divulgada."
          icon={<EventNoteIcon sx={{ fontSize: 48 }} />}
        />
      ) : (
        <AtividadesPainel
          eventoSlug={evento.slug}
          atividades={atividades}
          inscritasIds={evento.atividades.map((a) => a.id)}
          inscricaoConfirmada={evento.statusInscricao === "confirmada"}
        />
      )}
    </Box>
  );
}
