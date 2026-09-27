"use client";

import { useState } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { validarCheckin } from "@/lib/api";
import type { ResultadoCheckin } from "@/lib/types";

/**
 * Validação de check-in por código na portaria (RF04.8). Funciona em viewport
 * estreita (campo + botão empilham no mobile). Câmera/QR fica como evolução —
 * o leitor pode apenas preencher o mesmo campo de código.
 */
export default function CheckinForm({ eventoSlug }: { eventoSlug: string }) {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [validando, setValidando] = useState(false);

  async function validar() {
    if (!codigo.trim()) return;
    setValidando(true);
    setResultado(null);
    try {
      const r = await validarCheckin(eventoSlug, codigo);
      setResultado(r);
      if (r.ok) setCodigo("");
    } finally {
      setValidando(false);
    }
  }

  const severidade = !resultado
    ? "info"
    : resultado.ok
      ? "success"
      : resultado.motivo === "ja_validado"
        ? "warning"
        : "error";

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          void validar();
        }}
      >
        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "flex-start" } }}
        >
          <TextField
            label="Código do ingresso"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex.: SITC26-0001"
            fullWidth
            autoFocus
            disabled={validando}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={validando}
            sx={{ flexShrink: 0 }}
          >
            Validar
          </Button>
        </Stack>
      </Box>

      {resultado && (
        <Alert severity={severidade} sx={{ mt: 3 }}>
          <AlertTitle>
            {resultado.ok ? "Check-in confirmado" : "Não validado"}
          </AlertTitle>
          {resultado.ok
            ? `${resultado.participante} — ${resultado.codigo}`
            : resultado.mensagem}
        </Alert>
      )}
    </Box>
  );
}
