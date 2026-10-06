/**
 * ROTA: /admin/logs
 * OWNER: Igor   RF: RF16.3   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Consulta do log assíncrono de auditoria (somente administrador).
 * COMPONENTES: PageHeader, Table, Chip(status), EmptyState, Alert
 * DADOS: getLogs(token) (via @/lib/api — GET /admin/logs, JWT + RBAC admin).
 * ESTADOS: sem sessão / não-admin (403 Alert) / vazio (EmptyState) / erro (Alert).
 * DONE: responsivo, tokens do tema. O guard de rota (middleware) exige login;
 *   esta página TAMBÉM verifica o papel de administrador (defesa em profundidade).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getLogs } from "@/lib/api";
import { getSession, getToken } from "@/lib/auth/session";
import type { RegistroLog } from "@/lib/types";

export const metadata: Metadata = { title: "Logs" };

function ehAdministrador(perfis: string[]): boolean {
  return perfis.some((p) => ["admin", "administrador"].includes(p.toLowerCase()));
}

function corDoStatus(status: number): "success" | "warning" | "error" | "default" {
  if (status >= 500) return "error";
  if (status >= 400) return "warning";
  if (status >= 200 && status < 300) return "success";
  return "default";
}

function formatarData(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function LogsPage() {
  const session = await getSession();

  if (!session || !ehAdministrador(session.perfis)) {
    return (
      <>
        <PageHeader title="Logs" />
        <Alert severity="error">
          Acesso restrito a administradores.
        </Alert>
      </>
    );
  }

  const token = await getToken();
  let logs: RegistroLog[];
  try {
    logs = token ? await getLogs(token) : [];
  } catch {
    return (
      <>
        <PageHeader title="Logs" />
        <Alert severity="error">
          Não foi possível carregar os logs. Tente novamente mais tarde.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Logs" subtitle="Auditoria de requisições (RF16.3)" />
      {logs.length === 0 ? (
        <EmptyState
          title="Sem registros"
          description="Nenhuma requisição registrada no período disponível."
        />
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table size="small" aria-label="Logs de auditoria">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Duração</TableCell>
                <TableCell align="right">Usuário</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((l, i) => (
                <TableRow key={`${l.data}-${i}`} hover>
                  <TableCell>{formatarData(l.data)}</TableCell>
                  <TableCell>{l.metodo}</TableCell>
                  <TableCell>{l.url}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={l.statusCode}
                      color={corDoStatus(l.statusCode)}
                    />
                  </TableCell>
                  <TableCell align="right">{l.duracaoMs} ms</TableCell>
                  <TableCell align="right">{l.usuarioId ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
