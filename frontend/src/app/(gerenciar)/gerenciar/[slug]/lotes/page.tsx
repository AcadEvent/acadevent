/**
 * ROTA: /gerenciar/[slug]/lotes
 * OWNER: Arthur   RF: RF04.2   PRIORIDADE: MVP
 * PROPÓSITO: Lotes de ingresso do evento — criação e listagem. Sem lotes, não
 *   há como o participante se inscrever.
 * COMPONENTES: PageHeader, LotesGestao (form + tabela), Alert
 * DADOS: getEvento(slug), getLotes(idEdicao); criação via Server Action.
 * ESTADOS: erro (Alert); vazio dentro do componente.
 * DONE: responsivo, tokens do tema.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import { getEvento, getLotes } from "@/lib/api";
import type { Evento, LoteIngresso } from "@/lib/types";

import LotesGestao from "./LotesGestao";

export const metadata: Metadata = { title: "Lotes de ingresso" };

export default async function LotesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let lotes: LoteIngresso[];
  try {
    evento = await getEvento(slug);
    lotes = evento?.idEdicao ? await getLotes(evento.idEdicao) : [];
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar os lotes. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Lotes de ingresso"
        subtitle={
          evento ? `${evento.nome} · ingressos e valores` : "Ingressos e valores"
        }
      />
      <LotesGestao slug={slug} lotes={lotes} />
    </>
  );
}
