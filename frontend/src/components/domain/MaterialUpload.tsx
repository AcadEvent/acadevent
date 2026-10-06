"use client";

import { useRef, useState } from "react";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type ResultadoUpload =
  | { ok: true; url: string; nome: string }
  | { ok: false; erro: string };

/**
 * Upload de material (RF10). O envio propriamente dito é uma Server Action
 * (Bearer no servidor) passada por `onUploadAction`. Mostra erros 413/400/403 do
 * backend e desabilita o botão durante o envio.
 */
export default function MaterialUpload({
  onUploadAction,
}: {
  onUploadAction: (formData: FormData) => Promise<ResultadoUpload>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ url: string; nome: string } | null>(
    null,
  );

  async function enviar() {
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    setEnviado(null);
    const fd = new FormData();
    fd.append("file", arquivo);
    const r = await onUploadAction(fd);
    setEnviando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setEnviado({ url: r.url, nome: r.nome });
    setArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Stack spacing={2}>
      {erro && <Alert severity="error">{erro}</Alert>}
      {enviado && (
        <Alert severity="success">
          Material enviado:{" "}
          <Link href={enviado.url} target="_blank" rel="noopener">
            {enviado.nome}
          </Link>
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" } }}
      >
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          disabled={enviando}
        >
          Escolher arquivo
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          />
        </Button>
        {arquivo && (
          <Typography variant="body2" color="text.secondary">
            {arquivo.name}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={enviar}
          disabled={!arquivo}
          loading={enviando}
        >
          Enviar
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        PDF, imagens, slides ou planilhas. Máx. 15 MB.
      </Typography>
    </Stack>
  );
}
