import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";

import { formatIntervaloHora } from "@/lib/datas";
import type { Atividade, TipoAtividade } from "@/lib/types";

const TIPO_LABEL: Record<TipoAtividade, string> = {
  palestra: "Palestra",
  minicurso: "Minicurso",
  mesa_redonda: "Mesa-redonda",
  workshop: "Workshop",
  mostra: "Mostra",
  maratona: "Maratona",
  outro: "Atividade",
};

/** Rótulo do tipo: usa o rótulo cru do backend quando houver. */
export function rotuloTipo(atividade: Atividade): string {
  return atividade.tipoLabel ?? TIPO_LABEL[atividade.tipo];
}

function nomesMinistrantes(atividade: Atividade): string {
  return (atividade.ministrantes ?? []).map((m) => m.nome).join(", ");
}

/**
 * Cartão de atividade reutilizado no cronograma e na lista pública (RF05).
 * Quando `href` é passado, o cartão inteiro vira link para o detalhe.
 * Nunca renderiza e-mail de ministrante/inscrito (privacidade).
 */
export default function AtividadeCard({
  atividade,
  href,
}: {
  atividade: Atividade;
  href?: string;
}) {
  const ministrantes = nomesMinistrantes(atividade);
  const horario = formatIntervaloHora(atividade.inicio, atividade.fim);

  const conteudo = (
    <CardContent>
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip label={rotuloTipo(atividade)} size="small" color="primary" />
          {atividade.cargaHoraria != null && (
            <Chip
              label={`${atividade.cargaHoraria}h`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        <Typography variant="h6" component="h3">
          {atividade.titulo}
        </Typography>

        {horario && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <ScheduleIcon fontSize="small" />
            <Typography variant="body2">{horario}</Typography>
          </Stack>
        )}

        {atividade.local && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <PlaceIcon fontSize="small" />
            <Typography variant="body2">{atividade.local}</Typography>
          </Stack>
        )}

        {ministrantes && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <PersonIcon fontSize="small" />
            <Typography variant="body2">{ministrantes}</Typography>
          </Stack>
        )}
      </Stack>
    </CardContent>
  );

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      {href ? (
        <CardActionArea href={href} sx={{ height: "100%" }}>
          {conteudo}
        </CardActionArea>
      ) : (
        conteudo
      )}
    </Card>
  );
}
