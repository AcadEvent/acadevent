"use client";

import { useState } from "react";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface IniciarInscricaoProps {
  eventoSlug: string;
  /** Bloqueia o avanço quando as inscrições não estão abertas (RF01.5.3). */
  bloqueado?: boolean;
}

/**
 * Passo 1 do wizard de inscrição: revisão + aceite dos termos. NÃO coleta dados
 * cadastrais — a identidade do participante vem da conta autenticada (RF02) e o
 * backend recebe apenas lote/cupom (ver CriarInscricaoDto). O aceite dos termos
 * gate o avanço para a seleção de atividades.
 */
export default function IniciarInscricao({
  eventoSlug,
  bloqueado = false,
}: IniciarInscricaoProps) {
  const [aceito, setAceito] = useState(false);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Comece sua inscrição
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revise os dados do evento e do ingresso ao lado. Seus dados de
          participante vêm da sua conta; ao continuar, você escolhe as atividades
          e conclui o pagamento.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceito}
                onChange={(e) => setAceito(e.target.checked)}
                disabled={bloqueado}
              />
            }
            label={
              <Typography variant="body2">
                Li e aceito os <Link href="/termos">termos de uso</Link> e a{" "}
                <Link href="/privacidade">política de privacidade</Link>.
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button href={`/eventos/${eventoSlug}`} variant="text">
            Cancelar
          </Button>
          <Button
            href={`/eventos/${eventoSlug}/inscricao/atividades`}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={bloqueado || !aceito}
          >
            Continuar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
