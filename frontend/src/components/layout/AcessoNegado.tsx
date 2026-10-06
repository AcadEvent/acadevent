import LockPersonIcon from "@mui/icons-material/LockPerson";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Tela 403 para quando a sessão existe mas não tem o perfil exigido pela área
 * (RF02.1.2). O gate de perfil é aplicado nos layouts de (admin)/(gerenciar).
 * A autorização real por recurso continua no backend (RolesGuard).
 */
export default function AcessoNegado({ area }: { area: string }) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, sm: 12 } }}>
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
        <LockPersonIcon sx={{ fontSize: 56, color: "text.secondary" }} />
        <Typography variant="h5" component="h1">
          Acesso restrito
        </Typography>
        <Typography color="text.secondary">
          Sua conta não tem permissão para acessar a área de {area}. Se você
          deveria ter acesso, fale com um organizador do evento.
        </Typography>
        <Button href="/painel" variant="contained" sx={{ mt: 1 }}>
          Voltar ao meu painel
        </Button>
      </Stack>
    </Container>
  );
}
