/**
 * ROTA: /gerenciar/[slug]/pagamentos
 * OWNER: Arthur   RF: RF04.7, RF13   PRIORIDADE: MVP
 * PROPÓSITO: Relatório financeiro consolidado do evento (receita, pendências e
 *   recebido por método). A confirmação manual em si fica em /inscricoes (RF04.5).
 * COMPONENTES: PageHeader, Card (KPIs), Table, EmptyState
 * DADOS: getEvento(slug), getRelatorioFinanceiro(slug) (via @/lib/api)
 * ESTADOS: vazio (EmptyState) / erro (Alert)
 * DONE: responsivo, tokens do tema, estados cobertos.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getEvento, getRelatorioFinanceiro } from "@/lib/api";
import { getToken } from "@/lib/auth/session";
import type { Evento, MetodoPagamento, RelatorioFinanceiro } from "@/lib/types";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const METODO_LABEL: Record<MetodoPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
  gratuito: "Gratuito",
};

export const metadata: Metadata = {
  title: "Pagamentos",
};

export default async function PagamentosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let relatorio: RelatorioFinanceiro;
  try {
    evento = await getEvento(slug);
    const token = await getToken();
    relatorio =
      token && evento?.idEdicao
        ? await getRelatorioFinanceiro(token, evento.idEdicao)
        : {
            totalInscricoes: 0,
            confirmadas: 0,
            pendentes: 0,
            canceladas: 0,
            receitaConfirmada: 0,
            receitaPendente: 0,
            porMetodo: [],
          };
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar o relatório financeiro. Tente novamente mais
        tarde.
      </Alert>
    );
  }

  const kpis = [
    { titulo: "Receita confirmada", valor: moeda.format(relatorio.receitaConfirmada) },
    { titulo: "A receber (pendente)", valor: moeda.format(relatorio.receitaPendente) },
    {
      titulo: "Inscrições confirmadas",
      valor: `${relatorio.confirmadas}/${relatorio.totalInscricoes}`,
    },
    { titulo: "Pendentes", valor: String(relatorio.pendentes) },
  ];

  return (
    <>
      <PageHeader
        title="Pagamentos"
        subtitle={
          evento
            ? `${evento.nome} · relatório financeiro`
            : "Relatório financeiro"
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((k) => (
          <Grid key={k.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {k.titulo}
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{ mt: 0.5, fontWeight: 700, overflowWrap: "anywhere" }}
                >
                  {k.valor}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        Recebido por método
      </Typography>

      {relatorio.porMetodo.length === 0 ? (
        <EmptyState
          title="Sem pagamentos confirmados"
          description="Ainda não há receita confirmada neste evento."
        />
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table size="small" aria-label="Recebido por método">
            <TableHead>
              <TableRow>
                <TableCell>Método</TableCell>
                <TableCell align="right">Qtde.</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relatorio.porMetodo.map((m) => (
                <TableRow key={m.metodo}>
                  <TableCell>{METODO_LABEL[m.metodo]}</TableCell>
                  <TableCell align="right">{m.quantidade}</TableCell>
                  <TableCell align="right">{moeda.format(m.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
