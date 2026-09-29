/**
 * ROTA: /validar/[codigo]
 * OWNER: Igor   RF: RF11.7   PRIORIDADE: Pós-MVP
 * PROPÓSITO: Validação pública de autenticidade de um certificado pelo código.
 * COMPONENTES: Container, Alert(resultado), Card, Divider
 * DADOS: validarCertificado(codigo) (via @/lib/api — GET /certificados/:codigo/validar)
 * ESTADOS: válido (Card verde) / inválido (Alert) / erro (Alert).
 * DONE: responsivo, tokens do tema, e-mail exibido já mascarado pelo backend.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import VerifiedIcon from "@mui/icons-material/Verified";

import PageHeader from "@/components/layout/PageHeader";
import { validarCertificado } from "@/lib/api";
import { formatDiaLongo } from "@/lib/datas";
import type { ResultadoValidacaoCertificado } from "@/lib/types";

export const metadata: Metadata = { title: "Validar certificado" };

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0, sm: 1 }}
      sx={{ justifyContent: "space-between" }}
    >
      <Typography variant="body2" color="text.secondary">
        {rotulo}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {valor}
      </Typography>
    </Stack>
  );
}

export default async function ValidarCertificadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  let resultado: ResultadoValidacaoCertificado;
  try {
    resultado = await validarCertificado(codigo);
  } catch {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <PageHeader title="Validar certificado" />
        <Alert severity="error">
          Não foi possível validar o certificado agora. Tente novamente mais
          tarde.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader title="Validar certificado" />

      {!resultado.valido ? (
        <Alert severity="warning">
          <AlertTitle>Certificado não encontrado</AlertTitle>
          Não há certificado com o código <strong>{codigo}</strong>. Confira se
          digitou corretamente o código de autenticidade impresso no documento.
        </Alert>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", color: "success.main" }}
              >
                <VerifiedIcon />
                <Typography variant="h6" component="p">
                  Certificado autêntico
                </Typography>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Linha
                  rotulo="Participante"
                  valor={resultado.certificado.nomeParticipante}
                />
                {resultado.certificado.emailMascarado && (
                  <Linha
                    rotulo="E-mail"
                    valor={resultado.certificado.emailMascarado}
                  />
                )}
                <Linha rotulo="Evento" valor={resultado.certificado.evento} />
                {resultado.certificado.atividade && (
                  <Linha
                    rotulo="Atividade"
                    valor={resultado.certificado.atividade}
                  />
                )}
                {resultado.certificado.cargaHoraria != null && (
                  <Linha
                    rotulo="Carga horária"
                    valor={`${resultado.certificado.cargaHoraria}h`}
                  />
                )}
                {resultado.certificado.emitidoEm && (
                  <Linha
                    rotulo="Emitido em"
                    valor={formatDiaLongo(resultado.certificado.emitidoEm)}
                  />
                )}
                <Linha
                  rotulo="Código"
                  valor={resultado.certificado.codigo}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
