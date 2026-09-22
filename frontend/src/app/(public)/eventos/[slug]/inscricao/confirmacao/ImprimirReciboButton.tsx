"use client";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

/**
 * Abre o diálogo de impressão do navegador, de onde o recibo pode ser salvo em
 * PDF (RF04.6). O resto da página some na impressão via `displayPrint: "none"`.
 * TODO(api): trocar pelo download do PDF gerado no backend (Pagamento.url_recibo).
 */
export default function ImprimirReciboButton() {
  return (
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={() => window.print()}
    >
      Baixar recibo
    </Button>
  );
}
