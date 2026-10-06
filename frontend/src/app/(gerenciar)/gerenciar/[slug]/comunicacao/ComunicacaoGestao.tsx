"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SendIcon from "@mui/icons-material/Send";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import EmptyState from "@/components/ui/EmptyState";
import type { Comunicado } from "@/lib/types";

import { enviarComunicadoAction } from "./actions";

const SEGMENTOS = [
  { value: "todos", label: "Todos os inscritos" },
  { value: "Participante", label: "Participantes" },
  { value: "Ministrante", label: "Ministrantes" },
  { value: "Organizador", label: "Organizadores" },
];

function rotuloSegmento(alvo?: string): string {
  if (!alvo) return "Todos";
  const s = SEGMENTOS.find((x) => x.value.toLowerCase() === alvo.toLowerCase());
  return s?.label ?? alvo;
}

export default function ComunicacaoGestao({
  slug,
  idEdicao,
  comunicados,
}: {
  slug: string;
  idEdicao: number;
  comunicados: Comunicado[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    titulo: "",
    conteudo: "",
    perfil: "todos",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const valido = form.titulo.trim() !== "" && form.conteudo.trim() !== "";

  async function enviar() {
    if (!valido) return;
    setEnviando(true);
    setErro(null);
    setOk(false);
    const r = await enviarComunicadoAction(slug, {
      idEdicao,
      titulo: form.titulo.trim(),
      conteudo: form.conteudo.trim(),
      perfilAlvo: form.perfil,
    });
    setEnviando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setForm({ titulo: "", conteudo: "", perfil: "todos" });
    setOk(true);
    router.refresh();
  }

  return (
    <Stack spacing={4}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">
              Novo comunicado
            </Typography>
            {erro && <Alert severity="error">{erro}</Alert>}
            {ok && (
              <Alert severity="success">Comunicado enviado ao segmento.</Alert>
            )}
            <TextField
              select
              label="Enviar para"
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value })}
              fullWidth
            >
              {SEGMENTOS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Mensagem"
              value={form.conteudo}
              onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
              required
              fullWidth
              multiline
              minRows={4}
            />
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={enviar}
                disabled={!valido}
                loading={enviando}
              >
                Enviar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Comunicados enviados
        </Typography>
        {comunicados.length === 0 ? (
          <EmptyState
            title="Nenhum comunicado enviado"
            description="Os comunicados enviados nesta edição aparecerão aqui."
          />
        ) : (
          <Stack spacing={1.5}>
            {comunicados.map((c) => (
              <Card key={c.id} variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      <Chip
                        size="small"
                        label={rotuloSegmento(c.perfilAlvo)}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {c.titulo}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-line" }}
                      color="text.secondary"
                    >
                      {c.conteudo}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
