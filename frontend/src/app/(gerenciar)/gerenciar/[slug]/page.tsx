/**
 * ROTA: /gerenciar/[slug]
 * OWNER: Arthur   RF: RF03.2.1   PRIORIDADE: MVP
 * PROPÓSITO: Dashboard do organizador com indicadores do evento.
 * COMPONENTES: Grid, Card(KPI)
 * DADOS: getDashboard(slug) (via src/lib/api — nunca fetch direto)
 * ESTADOS: loading (Skeleton) / vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, usa tokens do tema (sem cor hardcoded), estados cobertos,
 *   este placeholder substituído por conteúdo real. Ver docs/atribuicoes.md.
 */
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupsIcon from "@mui/icons-material/Groups";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip, { type ChipProps } from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getDashboard } from "@/lib/api";
import type { DashboardEvento, StatusEvento } from "@/lib/types";

const STATUS_LABEL: Record<StatusEvento, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  em_andamento: "Em andamento",
  encerrado: "Encerrado",
  arquivado: "Arquivado",
};

const STATUS_COLOR: Record<StatusEvento, ChipProps["color"]> = {
  rascunho: "default",
  publicado: "info",
  em_andamento: "success",
  encerrado: "default",
  arquivado: "warning",
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const data = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface KpiCardProps {
  titulo: string;
  valor: string;
  detalhe: string;
  icon: ReactNode;
}

function KpiCard({ titulo, valor, detalhe, icon }: KpiCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {titulo}
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              flexShrink: 0,
              p: 1.25,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          variant="h4"
          component="p"
          sx={{
            mt: 0.5,
            fontWeight: 700,
            overflowWrap: "anywhere",
          }}
        >
          {valor}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {detalhe}
        </Typography>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Box aria-label="Carregando painel">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 3 }}
      >
        <Box sx={{ width: { xs: "100%", sm: "55%" } }}>
          <Skeleton variant="text" height={48} />
          <Skeleton variant="text" width="70%" />
        </Box>
        <Skeleton variant="rounded" width={150} height={40} />
      </Stack>

      <Grid container spacing={2.5}>
        {[0, 1, 2, 3].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="65%" height={44} />
                <Skeleton variant="text" width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
      </Grid>
    </Box>
  );
}

function DashboardContent({ dashboard }: { dashboard: DashboardEvento }) {
  const { evento } = dashboard;
  const ocupacao = evento.capacidade
    ? Math.min(
        100,
        Math.round((dashboard.totalInscricoes / evento.capacidade) * 100),
      )
    : 0;

  const kpis: KpiCardProps[] = [
    {
      titulo: "Inscrições",
      valor: dashboard.totalInscricoes.toLocaleString("pt-BR"),
      detalhe: `${dashboard.inscricoesConfirmadas.toLocaleString("pt-BR")} confirmadas`,
      icon: <HowToRegIcon />,
    },
    {
      titulo: "Pendentes",
      valor: dashboard.inscricoesPendentes.toLocaleString("pt-BR"),
      detalhe: "Aguardando confirmação",
      icon: <GroupsIcon />,
    },
    {
      titulo: "Atividades",
      valor: dashboard.totalAtividades.toLocaleString("pt-BR"),
      detalhe: "Cadastradas na programação",
      icon: <EventNoteIcon />,
    },
    {
      titulo: "Receita confirmada",
      valor: moeda.format(dashboard.receitaConfirmada),
      detalhe: "Pagamentos com status confirmado",
      icon: <AttachMoneyIcon />,
    },
  ];

  const atalhos: {
    titulo: string;
    descricao: string;
    href: string;
    icon: ReactNode;
  }[] = [
    {
      titulo: "Inscrições",
      descricao: "Acompanhe participantes e confirmações.",
      href: `/gerenciar/${evento.slug}/inscricoes`,
      icon: <HowToRegIcon />,
    },
    {
      titulo: "Atividades",
      descricao: "Organize a programação do evento.",
      href: `/gerenciar/${evento.slug}/atividades`,
      icon: <CalendarMonthIcon />,
    },
    {
      titulo: "Pagamentos",
      descricao: "Consulte recebimentos e pendências.",
      href: `/gerenciar/${evento.slug}/pagamentos`,
      icon: <CreditCardIcon />,
    },
    {
      titulo: "Pessoas",
      descricao: "Gerencie os perfis vinculados ao evento.",
      href: `/gerenciar/${evento.slug}/pessoas`,
      icon: <PeopleIcon />,
    },
  ];

  return (
    <>
      <PageHeader
        title={evento.nome}
        subtitle="Visão geral da organização e dos principais indicadores."
        actions={
          <Button
            href={`/eventos/${evento.slug}`}
            variant="outlined"
            endIcon={<OpenInNewIcon />}
          >
            Ver página pública
          </Button>
        }
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Chip
          label={STATUS_LABEL[evento.status]}
          color={STATUS_COLOR[evento.status]}
          size="small"
        />
        {(evento.sigla || evento.edicao) && (
          <Typography variant="body2" color="text.secondary">
            {[evento.sigla, evento.edicao].filter(Boolean).join(" · ")}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {data.format(new Date(evento.inicio))} –{" "}
          {data.format(new Date(evento.fim))}
        </Typography>
      </Stack>

      <Grid container spacing={2.5} padding-bottom={1}>
        {kpis.map((kpi) => (
          <Grid key={kpi.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" component="h2">
                Ocupação do evento
              </Typography>
              {evento.capacidade ? (
                <>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ justifyContent: "space-between", mt: 3, mb: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {dashboard.totalInscricoes.toLocaleString("pt-BR")} de{" "}
                      {evento.capacidade.toLocaleString("pt-BR")} vagas
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ocupacao}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={ocupacao}
                    aria-label={`${ocupacao}% das vagas ocupadas`}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1.5, display: "block" }}
                  >
                    Baseado no total de inscrições registradas.
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Defina a capacidade máxima para acompanhar a ocupação.
                </Typography>
              )}
              <Button
                href={`/gerenciar/${evento.slug}/configuracoes`}
                startIcon={<SettingsIcon />}
                variant="outlined"
                fullWidth
                sx={{ mt: 2.5 }}
              >
                Configurar evento
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Acesso rápido
          </Typography>
          <Grid container spacing={2}>
            {atalhos.map((atalho) => (
              <Grid key={atalho.titulo} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardActionArea href={atalho.href} sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <Box
                          sx={{ color: "primary.main", display: "inline-flex" }}
                        >
                          {atalho.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            component="h3"
                            sx={{ fontWeight: 600 }}
                          >
                            {atalho.titulo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {atalho.descricao}
                          </Typography>
                        </Box>
                        <ArrowForwardIcon
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default function DashboardOrganizadorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [dashboard, setDashboard] = useState<DashboardEvento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    getDashboard(slug)
      .then((resultado) => {
        if (ativo) {
          setDashboard(resultado);
          setErro(false);
        }
      })
      .catch(() => {
        if (ativo) {
          setErro(true);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [slug]);

  return (
    <Container maxWidth="lg" disableGutters>
      {carregando ? (
        <DashboardSkeleton />
      ) : erro ? (
        <Alert severity="error">
          <AlertTitle>Não foi possível carregar o painel</AlertTitle>
          Tente atualizar a página em alguns instantes.
        </Alert>
      ) : !dashboard ? (
        <EmptyState
          title="Evento não encontrado"
          description="Este evento não existe ou não está disponível para a sua conta."
          action={
            <Button href="/gerenciar/eventos" variant="contained">
              Voltar para meus eventos
            </Button>
          }
        />
      ) : (
        <DashboardContent dashboard={dashboard} />
      )}
    </Container>
  );
}
