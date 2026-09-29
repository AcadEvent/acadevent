"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { criarItem, devolverItem, retirarItem } from "@/lib/api";
import type { ItemInventario } from "@/lib/types";

const abaixoDoMinimo = (i: ItemInventario) =>
  i.quantidadeDisponivel <= i.quantidadeMinima;

type Movimento = { item: ItemInventario; tipo: "retirar" | "devolver" };

export default function InventarioGestao({
  eventoSlug,
  itens: iniciais,
}: {
  eventoSlug: string;
  itens: ItemInventario[];
}) {
  const [itens, setItens] = useState(iniciais);
  const alertas = itens.filter(abaixoDoMinimo);

  // ── Novo item ──
  const [itemAberto, setItemAberto] = useState(false);
  const [salvandoItem, setSalvandoItem] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    total: "",
    minima: "",
  });
  const formValido =
    form.nome.trim() !== "" &&
    Number(form.total) > 0 &&
    Number(form.minima) >= 0;

  async function salvarItem() {
    if (!formValido) return;
    setSalvandoItem(true);
    try {
      const novo = await criarItem({
        eventoSlug,
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        quantidadeTotal: Number(form.total),
        quantidadeMinima: Number(form.minima),
      });
      setItens((lista) => [...lista, novo]);
      setForm({ nome: "", descricao: "", total: "", minima: "" });
      setItemAberto(false);
    } finally {
      setSalvandoItem(false);
    }
  }

  // ── Retirar / devolver ──
  const [mov, setMov] = useState<Movimento | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [erroMov, setErroMov] = useState<string | null>(null);
  const [salvandoMov, setSalvandoMov] = useState(false);

  function abrirMov(item: ItemInventario, tipo: Movimento["tipo"]) {
    setMov({ item, tipo });
    setQuantidade("");
    setErroMov(null);
  }

  async function salvarMov() {
    if (!mov) return;
    const qtd = Number(quantidade);
    setSalvandoMov(true);
    setErroMov(null);
    try {
      const r =
        mov.tipo === "retirar"
          ? await retirarItem(mov.item.id, qtd)
          : await devolverItem(mov.item.id, qtd);
      if (!r.ok) {
        setErroMov(r.erro);
        return;
      }
      setItens((lista) =>
        lista.map((i) => (i.id === r.item.id ? { ...r.item } : i)),
      );
      setMov(null);
    } finally {
      setSalvandoMov(false);
    }
  }

  return (
    <>
      {alertas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Estoque baixo</AlertTitle>
          No mínimo ou abaixo: {alertas.map((i) => i.nome).join(", ")}.
        </Alert>
      )}

      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Itens
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setItemAberto(true)}
        >
          Novo item
        </Button>
      </Stack>

      {itens.length === 0 ? (
        <Alert severity="info">Nenhum item de inventário cadastrado.</Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table size="small" aria-label="Itens de inventário">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Disponível</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Mínima</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itens.map((i) => (
                <TableRow key={i.id} hover>
                  <TableCell>
                    {i.nome}
                    {i.descricao && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {i.descricao}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{i.quantidadeDisponivel}</TableCell>
                  <TableCell align="right">{i.quantidadeTotal}</TableCell>
                  <TableCell align="right">{i.quantidadeMinima}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={abaixoDoMinimo(i) ? "Baixo" : "OK"}
                      color={abaixoDoMinimo(i) ? "warning" : "success"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => abrirMov(i, "retirar")}
                        disabled={i.quantidadeDisponivel === 0}
                      >
                        Retirar
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => abrirMov(i, "devolver")}
                        disabled={i.quantidadeDisponivel === i.quantidadeTotal}
                      >
                        Devolver
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog: novo item */}
      <Dialog
        open={itemAberto}
        onClose={() => !salvandoItem && setItemAberto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Novo item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome do item"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Quantidade total"
                type="number"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Quantidade mínima"
                type="number"
                value={form.minima}
                onChange={(e) => setForm({ ...form, minima: e.target.value })}
                required
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemAberto(false)} disabled={salvandoItem}>
            Cancelar
          </Button>
          <Button
            onClick={salvarItem}
            variant="contained"
            disabled={!formValido}
            loading={salvandoItem}
          >
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: retirar / devolver */}
      <Dialog
        open={Boolean(mov)}
        onClose={() => !salvandoMov && setMov(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {mov?.tipo === "retirar" ? "Retirar" : "Devolver"} — {mov?.item.nome}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {erroMov && <Alert severity="error">{erroMov}</Alert>}
            <TextField
              label="Quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              autoFocus
              fullWidth
              helperText={
                mov
                  ? `Disponível: ${mov.item.quantidadeDisponivel} de ${mov.item.quantidadeTotal}`
                  : undefined
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMov(null)} disabled={salvandoMov}>
            Cancelar
          </Button>
          <Button
            onClick={salvarMov}
            variant="contained"
            disabled={Number(quantidade) <= 0}
            loading={salvandoMov}
          >
            {mov?.tipo === "retirar" ? "Retirar" : "Devolver"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
