import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { sairAction } from "@/lib/auth/actions";

/** Iniciais para o avatar: primeira letra do primeiro e do último nome. */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Indicador de sessão: avatar com iniciais + primeiro nome (atalho para o
 * painel) e botão Sair (sairAction). Usado no cabeçalho público e no shell
 * autenticado para que o estado "logado como X" fique sempre visível.
 */
export default function MenuUsuario({ nome }: { nome: string }) {
  const primeiroNome = nome.trim().split(/\s+/)[0] || nome;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Link
        href="/painel"
        underline="none"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "text.primary",
        }}
      >
        <Avatar
          sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main" }}
        >
          {iniciais(nome)}
        </Avatar>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}
        >
          {primeiroNome}
        </Typography>
      </Link>
      <Box component="form" action={sairAction}>
        <Button
          type="submit"
          color="inherit"
          size="small"
          startIcon={<LogoutIcon />}
        >
          Sair
        </Button>
      </Box>
    </Stack>
  );
}
