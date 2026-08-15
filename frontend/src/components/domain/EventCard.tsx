import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EventIcon from "@mui/icons-material/Event";
import PlaceIcon from "@mui/icons-material/Place";
import type { Evento, StatusInscricao } from "@/lib/types";

const INSCRICAO_LABEL: Record<StatusInscricao, string> = {
  abertas: "Inscrições abertas",
  encerradas: "Inscrições encerradas",
  esgotadas: "Esgotado",
  em_breve: "Em breve",
};

const INSCRICAO_COLOR: Record<
  StatusInscricao,
  "success" | "default" | "error" | "info"
> = {
  abertas: "success",
  encerradas: "default",
  esgotadas: "error",
  em_breve: "info",
};

function formatPeriodo(inicio: string, fim: string): string {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(new Date(inicio))} – ${fmt.format(new Date(fim))}`;
}

/**
 * Cartão de evento (componente de domínio, Fase 3): Card + Typography + Chip.
 * Exemplo canônico de composição sobre primitivos MUI — sem cor hardcoded,
 * cores vindas dos tokens de status. Usado na landing e na listagem /eventos.
 */
export default function EventCard({ evento }: { evento: Evento }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        href={`/eventos/${evento.slug}`}
        sx={{ height: "100%", alignItems: "flex-start" }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Chip
              size="small"
              color={INSCRICAO_COLOR[evento.inscricao]}
              label={INSCRICAO_LABEL[evento.inscricao]}
            />
            {evento.sigla && (
              <Typography variant="caption" color="text.secondary">
                {evento.sigla} {evento.edicao}
              </Typography>
            )}
          </Stack>

          <Typography variant="h6" component="h3" gutterBottom>
            {evento.nome}
          </Typography>

          {evento.descricao && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {evento.descricao}
            </Typography>
          )}

          <Stack spacing={0.5} sx={{ color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <EventIcon fontSize="small" />
              <Typography variant="caption">
                {formatPeriodo(evento.inicio, evento.fim)}
              </Typography>
            </Box>
            {evento.local && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PlaceIcon fontSize="small" />
                <Typography variant="caption">{evento.local}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
