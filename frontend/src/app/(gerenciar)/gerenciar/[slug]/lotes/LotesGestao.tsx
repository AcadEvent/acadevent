"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
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

import EmptyState from "@/components/ui/EmptyState";
import type { LoteIngresso } from "@/lib/types";

import { criarLoteAction } from "./actions";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function periodo(l: LoteIngresso): string {
  const a = l.abertura ? dataFmt.format(new Date(l.abertura)) : null;
  const f = l.encerramento ? dataFmt.format(new Date(l.encerramento)) : null;
  if (a && f) return `${a} – ${f}`;
  if (a) return `a partir de ${a}`;
  if (f) return `até ${f}`;
  return "sem período definido";
}

export default function LotesGestao({
  slug,
  lotes: iniciais,
}: {
  slug: string;
  lotes: LoteIngresso[];
}) {
  const [lotes, setLotes] = useState(iniciais);
  const [form, setForm] = useState({
    nome: "",
    preco: "",
    vagas: "",
    abertura: "",
    encerramento: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valido =
    form.nome.trim() !== "" &&
    form.preco !== "" &&
    Number(form.preco) >= 0 &&
    form.vagas !== "" &&
    Number.isInteger(Number(form.vagas)) &&
    Number(form.vagas) >= 1 &&
    (!form.abertura ||
      !form.encerramento ||
      form.abertura <= form.encerramento);

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    const r = await criarLoteAction(slug, {
      nome: form.nome.trim(),
      preco: Number(form.preco),
      vagas: Number(form.vagas),
      abertura: form.abertura
        ? `${form.abertura}T00:00:00`
        : undefined,
      encerramento: form.encerramento
        ? `${form.encerramento}T23:59:59`
        : undefined,
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setLotes((lista) => [...lista, r.lote]);
    setForm({ nome: "", preco: "", vagas: "", abertura: "", encerramento: "" });
  }

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Novo lote
          </Typography>
          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nome do lote"
                placeholder="Ex.: Lote promocional"
                fullWidth
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                disabled={salvando}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Preço (R$)"
                type="number"
                fullWidth
                required
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                disabled={salvando}
                helperText="0 = gratuito"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Vagas"
                type="number"
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                value={form.vagas}
                onChange={(e) => setForm({ ...form, vagas: e.target.value })}
                disabled={salvando}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Abertura"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.abertura}
                onChange={(e) => setForm({ ...form, abertura: e.target.value })}
                disabled={salvando}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Encerramento"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.encerramento}
                onChange={(e) =>
                  setForm({ ...form, encerramento: e.target.value })
                }
                disabled={salvando}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={salvar}
            disabled={!valido}
            loading={salvando}
            sx={{ mt: 2 }}
          >
            Criar lote
          </Button>
        </CardContent>
      </Card>

      {lotes.length === 0 ? (
        <EmptyState
          title="Nenhum lote cadastrado"
          description="Crie ao menos um lote para abrir as inscrições do evento."
        />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
          <Table size="small" aria-label="Lotes de ingresso">
            <TableHead>
              <TableRow>
                <TableCell>Lote</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="right">Vagas</TableCell>
                <TableCell>Período</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lotes.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{l.nome}</TableCell>
                  <TableCell align="right">
                    {l.preco === 0 ? "Gratuito" : moeda.format(l.preco)}
                  </TableCell>
                  <TableCell align="right">{l.vagas}</TableCell>
                  <TableCell>{periodo(l)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
