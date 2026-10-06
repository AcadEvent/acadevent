/**
 * ROTA: /gerenciar/[slug]/comunicacao
 * OWNER: Arthur   RF: RF09.2–4   PRIORIDADE: MVP
 * PROPÓSITO: Enviar comunicados gerais/segmentados e listar os já enviados.
 * COMPONENTES: PageHeader, Card + form (ComunicacaoGestao), lista de comunicados
 * DADOS: getEvento(slug) + getComunicadosDaEdicao(idEdicao) (público). Envio via
 *   Server Action (POST /comunicacao/enviar), protegido por JWT (organizador/admin).
 * ESTADOS: erro (Alert); vazio dentro do componente.
 * DONE: responsivo, tokens do tema. NOTA: o envio exige sessão de organizador
 *   (401/403 até o login com o banco semeado funcionar).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import { getComunicadosDaEdicao, getEvento } from "@/lib/api";
import type { Comunicado, Evento } from "@/lib/types";

import ComunicacaoGestao from "./ComunicacaoGestao";

export const metadata: Metadata = { title: "Comunicação" };

export default async function ComunicacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let comunicados: Comunicado[];
  try {
    evento = await getEvento(slug);
    comunicados =
      evento?.idEdicao != null
        ? await getComunicadosDaEdicao(evento.idEdicao)
        : [];
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar os comunicados. Tente novamente mais tarde.
      </Alert>
    );
  }

  if (!evento?.idEdicao) {
    return (
      <Alert severity="warning">
        Evento não encontrado ou sem edição associada.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Comunicação"
        subtitle={`${evento.nome} · comunicados e segmentação`}
      />
      <ComunicacaoGestao
        slug={slug}
        idEdicao={evento.idEdicao}
        comunicados={comunicados}
      />
    </>
  );
}
