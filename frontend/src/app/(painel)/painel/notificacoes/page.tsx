/**
 * ROTA: /painel/notificacoes
 * OWNER: Kauan   RF: RF03.1.5, RF09.4   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Central de notificações do usuário autenticado.
 * COMPONENTES: PageHeader, List, EmptyState, Alert
 * DADOS: getMinhasNotificacoes(token) (via @/lib/api — GET /comunicacao/minhas-notificacoes)
 * ESTADOS: sem sessão (Alert) / vazio (EmptyState) / erro (Alert).
 * DONE: responsivo, tokens do tema. Exige sessão (o guard de rota cobre /painel).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getMinhasNotificacoes } from "@/lib/api";
import { getToken } from "@/lib/auth/session";
import type { Notificacao } from "@/lib/types";

export const metadata: Metadata = { title: "Notificações" };

function formatarData(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function NotificacoesPage() {
  const token = await getToken();

  if (!token) {
    return (
      <>
        <PageHeader title="Notificações" />
        <Alert severity="info">
          Entre na sua conta para ver suas notificações.
        </Alert>
      </>
    );
  }

  let notificacoes: Notificacao[];
  try {
    notificacoes = await getMinhasNotificacoes(token);
  } catch {
    return (
      <>
        <PageHeader title="Notificações" />
        <Alert severity="error">
          Não foi possível carregar suas notificações. Tente novamente mais
          tarde.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Notificações" />
      {notificacoes.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          description="Você ainda não recebeu comunicados dos eventos em que está inscrito."
        />
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {notificacoes.map((n) => (
              <ListItem key={n.id} divider alignItems="flex-start">
                <ListItemText
                  primary={n.titulo}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {n.mensagem}
                      </Typography>
                      {n.data && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {formatarData(n.data)}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}
