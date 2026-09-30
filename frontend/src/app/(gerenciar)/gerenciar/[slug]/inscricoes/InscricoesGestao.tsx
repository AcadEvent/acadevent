"use client";

import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip, { type ChipProps } from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import type { InscricaoEdicao, StatusPagamento } from "@/lib/types";

import { confirmarPagamentoAction } from "./actions";

const STATUS_LABEL: Record<StatusPagamento, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  estornado: "Estornado",
};

const STATUS_COLOR: Record<StatusPagamento, ChipProps["color"]> = {
  pendente: "warning",
  confirmado: "success",
  cancelado: "default",
  estornado: "default",
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Tabela de inscrições do organizador com confirmação manual de pagamento
 * (RF04.1, RF04.5). Padrão tabela + dialog de confirmação reutilizável na gestão.
 */
export default function InscricoesGestao({
  inscricoes,
}: {
  inscricoes: InscricaoEdicao[];
}) {
  const [alvo, setAlvo] = useState<InscricaoEdicao | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    if (!alvo) return;
    setConfirmando(true);
    setErro(null);
    try {
      await confirmarPagamentoAction(alvo.id);
      setAlvo(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível confirmar.");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <>
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro(null)}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Inscrições do evento">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Participante</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inscricoes.map((i) => (
              <TableRow key={i.id} hover>
                <TableCell>{i.codigo ?? i.id}</TableCell>
                <TableCell>{i.participante}</TableCell>
                <TableCell>{i.loteNome ?? "—"}</TableCell>
                <TableCell align="right">{moeda.format(i.valor)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[i.statusPagamento]}
                    color={STATUS_COLOR[i.statusPagamento]}
                  />
                </TableCell>
                <TableCell>{dataFmt.format(new Date(i.criadaEm))}</TableCell>
                <TableCell align="right">
                  {i.statusPagamento === "pendente" ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setAlvo(i)}
                    >
                      Confirmar
                    </Button>
                  ) : (
                    <Box component="span" sx={{ color: "text.disabled" }}>
                      —
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(alvo)}
        onClose={() => !confirmando && setAlvo(null)}
      >
        <DialogTitle>Confirmar pagamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirmar o pagamento da inscrição {alvo?.codigo ?? ""} de{" "}
            {alvo?.participante}
            {alvo ? ` (${moeda.format(alvo.valor)})` : ""}? A inscrição passa a
            constar como confirmada (RF04.5).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlvo(null)} disabled={confirmando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} variant="contained" loading={confirmando}>
            Confirmar pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
