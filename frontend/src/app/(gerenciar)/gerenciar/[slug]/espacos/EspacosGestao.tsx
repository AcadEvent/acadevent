"use client";

import { useState } from "react";

import type { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";

import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { criarEspaco, criarReserva } from "@/lib/api";
import type { Espaco, Reserva } from "@/lib/types";

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function faixa(inicio: string, fim: string): string {
  return `${dataHora.format(new Date(inicio))} – ${dataHora.format(new Date(fim))}`;
}

interface Props {
  eventoSlug: string;
  espacos: Espaco[];
  reservas: Reserva[];
}

export default function EspacosGestao({
  eventoSlug,
  espacos: espacosIniciais,
  reservas: reservasIniciais,
}: Props) {
  const [espacos, setEspacos] = useState(espacosIniciais);
  const [reservas, setReservas] = useState(reservasIniciais);

  // ── Cadastro de sala ──
  const [salaAberta, setSalaAberta] = useState(false);
  const [salvandoSala, setSalvandoSala] = useState(false);
  const [sala, setSala] = useState({
    nome: "",
    tipo: "",
    capacidade: "",
    local: "",
    recursos: "",
  });

  const salaValida = sala.nome.trim() !== "" && Number(sala.capacidade) > 0;

  async function salvarSala() {
    if (!salaValida) return;
    setSalvandoSala(true);
    try {
      const novo = await criarEspaco({
        eventoSlug,
        nome: sala.nome.trim(),
        tipo: sala.tipo.trim() || undefined,
        capacidade: Number(sala.capacidade),
        local: sala.local.trim() || undefined,
        recursos: sala.recursos.trim() || undefined,
      });
      setEspacos((lista) => [...lista, novo]);
      setSala({ nome: "", tipo: "", capacidade: "", local: "", recursos: "" });
      setSalaAberta(false);
    } finally {
      setSalvandoSala(false);
    }
  }

  // ── Nova reserva ──
  const [reservaAberta, setReservaAberta] = useState(false);
  const [salvandoReserva, setSalvandoReserva] = useState(false);
  const [erroReserva, setErroReserva] = useState<string | null>(null);
  const [reserva, setReserva] = useState<{
    espacoId: string;
    titulo: string;
    inicio: Dayjs | null;
    fim: Dayjs | null;
  }>({ espacoId: "", titulo: "", inicio: null, fim: null });

  const reservaValida =
    reserva.espacoId !== "" &&
    reserva.titulo.trim() !== "" &&
    reserva.inicio !== null &&
    reserva.fim !== null;

  async function salvarReserva() {
    if (!reservaValida || !reserva.inicio || !reserva.fim) return;
    setSalvandoReserva(true);
    setErroReserva(null);
    try {
      const r = await criarReserva({
        espacoId: reserva.espacoId,
        titulo: reserva.titulo.trim(),
        inicio: reserva.inicio.toISOString(),
        fim: reserva.fim.toISOString(),
      });
      if (!r.ok) {
        setErroReserva(r.erro);
        return;
      }
      setReservas((lista) => [...lista, r.reserva]);
      setReserva({ espacoId: "", titulo: "", inicio: null, fim: null });
      setReservaAberta(false);
    } finally {
      setSalvandoReserva(false);
    }
  }

  const nomeEspaco = (id: string) =>
    espacos.find((e) => e.id === id)?.nome ?? "—";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      {/* Salas */}
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Espaços
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setSalaAberta(true)}
        >
          Nova sala
        </Button>
      </Stack>

      {espacos.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          Nenhum espaço cadastrado. Comece cadastrando uma sala.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mb: 4, overflowX: "auto" }}
        >
          <Table size="small" aria-label="Espaços">
            <TableHead>
              <TableRow>
                <TableCell>Sala</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Capacidade</TableCell>
                <TableCell>Local</TableCell>
                <TableCell>Recursos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {espacos.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.nome}</TableCell>
                  <TableCell>
                    {e.tipo ? <Chip size="small" label={e.tipo} /> : "—"}
                  </TableCell>
                  <TableCell align="right">{e.capacidade}</TableCell>
                  <TableCell>{e.local ?? "—"}</TableCell>
                  <TableCell>{e.recursos ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reservas / ocupação */}
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Reservas
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setReservaAberta(true)}
          disabled={espacos.length === 0}
        >
          Nova reserva
        </Button>
      </Stack>

      {reservas.length === 0 ? (
        <Alert severity="info">Nenhuma reserva neste evento.</Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
        >
          <Table size="small" aria-label="Reservas">
            <TableHead>
              <TableRow>
                <TableCell>Espaço</TableCell>
                <TableCell>Finalidade</TableCell>
                <TableCell>Período</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{nomeEspaco(r.espacoId)}</TableCell>
                  <TableCell>{r.titulo}</TableCell>
                  <TableCell>{faixa(r.inicio, r.fim)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog: nova sala */}
      <Dialog
        open={salaAberta}
        onClose={() => !salvandoSala && setSalaAberta(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nova sala</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome da sala"
              value={sala.nome}
              onChange={(e) => setSala({ ...sala, nome: e.target.value })}
              required
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Tipo"
                placeholder="Auditório, Laboratório…"
                value={sala.tipo}
                onChange={(e) => setSala({ ...sala, tipo: e.target.value })}
                fullWidth
              />
              <TextField
                label="Capacidade"
                type="number"
                value={sala.capacidade}
                onChange={(e) =>
                  setSala({ ...sala, capacidade: e.target.value })
                }
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="Local"
              value={sala.local}
              onChange={(e) => setSala({ ...sala, local: e.target.value })}
              fullWidth
            />
            <TextField
              label="Recursos disponíveis"
              value={sala.recursos}
              onChange={(e) => setSala({ ...sala, recursos: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalaAberta(false)} disabled={salvandoSala}>
            Cancelar
          </Button>
          <Button
            onClick={salvarSala}
            variant="contained"
            disabled={!salaValida}
            loading={salvandoSala}
          >
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: nova reserva */}
      <Dialog
        open={reservaAberta}
        onClose={() => !salvandoReserva && setReservaAberta(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nova reserva</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {erroReserva && <Alert severity="error">{erroReserva}</Alert>}
            <TextField
              label="Espaço"
              select
              value={reserva.espacoId}
              onChange={(e) =>
                setReserva({ ...reserva, espacoId: e.target.value })
              }
              required
              fullWidth
            >
              {espacos.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Finalidade"
              placeholder="Ex.: Abertura, Minicurso…"
              value={reserva.titulo}
              onChange={(e) =>
                setReserva({ ...reserva, titulo: e.target.value })
              }
              required
              fullWidth
            />
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <DateTimePicker
                label="Início"
                value={reserva.inicio}
                onChange={(v) => setReserva({ ...reserva, inicio: v })}
                format="DD/MM/YYYY HH:mm"
                sx={{ width: "100%" }}
              />
              <DateTimePicker
                label="Término"
                value={reserva.fim}
                onChange={(v) => setReserva({ ...reserva, fim: v })}
                minDateTime={reserva.inicio ?? undefined}
                format="DD/MM/YYYY HH:mm"
                sx={{ width: "100%" }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReservaAberta(false)}
            disabled={salvandoReserva}
          >
            Cancelar
          </Button>
          <Button
            onClick={salvarReserva}
            variant="contained"
            disabled={!reservaValida}
            loading={salvandoReserva}
          >
            Reservar
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
