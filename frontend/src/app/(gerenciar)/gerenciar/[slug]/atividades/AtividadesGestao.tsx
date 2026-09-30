"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
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

import { rotuloTipo } from "@/components/domain/AtividadeCard";
import { formatIntervaloHora } from "@/lib/datas";
import type { Atividade } from "@/lib/types";

import {
  associarMinistranteAction,
  criarAtividadeAction,
} from "./actions";

const TIPOS = [
  "Palestra",
  "Minicurso",
  "Mesa-redonda",
  "Workshop",
  "Oficina",
  "Mostra",
  "Maratona",
  "Outro",
];

/** datetime-local ("2026-05-13T08:30") → ISO em UTC ("...:00.000Z"). */
function paraIso(valor: string): string | undefined {
  return valor ? `${valor}:00.000Z` : undefined;
}

export default function AtividadesGestao({
  slug,
  idEdicao,
  atividades,
}: {
  slug: string;
  idEdicao: number;
  atividades: Atividade[];
}) {
  const router = useRouter();

  // ── Nova atividade ──
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "Palestra",
    descricao: "",
    carga: "",
    inicio: "",
    fim: "",
  });
  const formValido = form.titulo.trim() !== "" && Number(form.carga) >= 1;

  async function salvar() {
    if (!formValido) return;
    setSalvando(true);
    setErro(null);
    const r = await criarAtividadeAction(slug, {
      idEdicao,
      titulo: form.titulo.trim(),
      tipoAtividade: form.tipo,
      descricao: form.descricao.trim() || undefined,
      cargaHoraria: Number(form.carga),
      inicio: paraIso(form.inicio),
      fim: paraIso(form.fim),
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setForm({
      titulo: "",
      tipo: "Palestra",
      descricao: "",
      carga: "",
      inicio: "",
      fim: "",
    });
    setAberto(false);
    router.refresh();
  }

  // ── Associar ministrante ──
  const [assoc, setAssoc] = useState<Atividade | null>(null);
  const [idMinistrante, setIdMinistrante] = useState("");
  const [salvandoAssoc, setSalvandoAssoc] = useState(false);
  const [erroAssoc, setErroAssoc] = useState<string | null>(null);

  function abrirAssoc(atividade: Atividade) {
    setAssoc(atividade);
    setIdMinistrante("");
    setErroAssoc(null);
  }

  async function salvarAssoc() {
    if (!assoc || Number(idMinistrante) <= 0) return;
    setSalvandoAssoc(true);
    setErroAssoc(null);
    const r = await associarMinistranteAction(
      slug,
      Number(assoc.id),
      Number(idMinistrante),
    );
    setSalvandoAssoc(false);
    if (!r.ok) {
      setErroAssoc(r.erro);
      return;
    }
    setAssoc(null);
    router.refresh();
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Atividades
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAberto(true)}
        >
          Nova atividade
        </Button>
      </Stack>

      {atividades.length === 0 ? (
        <Alert severity="info">Nenhuma atividade cadastrada.</Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table size="small" aria-label="Atividades">
            <TableHead>
              <TableRow>
                <TableCell>Atividade</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Ministrantes</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atividades.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.titulo}</TableCell>
                  <TableCell>
                    <Chip size="small" label={rotuloTipo(a)} />
                  </TableCell>
                  <TableCell>
                    {formatIntervaloHora(a.inicio, a.fim) || "—"}
                  </TableCell>
                  <TableCell>
                    {(a.ministrantes ?? []).map((m) => m.nome).join(", ") ||
                      "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => abrirAssoc(a)}>
                      Associar ministrante
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog: nova atividade */}
      <Dialog
        open={aberto}
        onClose={() => !salvando && setAberto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nova atividade</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {erro && <Alert severity="error">{erro}</Alert>}
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              fullWidth
            >
              {TIPOS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Carga horária (h)"
              type="number"
              value={form.carga}
              onChange={(e) => setForm({ ...form, carga: e.target.value })}
              required
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Início"
                type="datetime-local"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Fim"
                type="datetime-local"
                value={form.fim}
                onChange={(e) => setForm({ ...form, fim: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAberto(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            variant="contained"
            disabled={!formValido}
            loading={salvando}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: associar ministrante */}
      <Dialog
        open={Boolean(assoc)}
        onClose={() => !salvandoAssoc && setAssoc(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Associar ministrante — {assoc?.titulo}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {erroAssoc && <Alert severity="error">{erroAssoc}</Alert>}
            <TextField
              label="ID do ministrante"
              type="number"
              value={idMinistrante}
              onChange={(e) => setIdMinistrante(e.target.value)}
              autoFocus
              fullWidth
              helperText="Identificador do ministrante cadastrado na edição."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssoc(null)} disabled={salvandoAssoc}>
            Cancelar
          </Button>
          <Button
            onClick={salvarAssoc}
            variant="contained"
            disabled={Number(idMinistrante) <= 0}
            loading={salvandoAssoc}
          >
            Associar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
