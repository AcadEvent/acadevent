/**
 * ROTA: /gerenciar/[slug]/espacos
 * OWNER: Arthur   RF: RF07.1–2   PRIORIDADE: MVP
 * PROPÓSITO: Cadastro de espaços e reservas do evento, com detecção de conflito
 *   de horário no mesmo espaço.
 * COMPONENTES: PageHeader, Table + Dialog (EspacosGestao), DateTimePicker
 * DADOS: getEvento(slug), getEspacos(slug), getReservas(slug) (via @/lib/api)
 * ESTADOS: erro (Alert); vazio tratado dentro do componente
 * DONE: responsivo, tokens do tema, conflito visível.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import { getEspacos, getEvento, getReservas } from "@/lib/api";
import type { Espaco, Evento, Reserva } from "@/lib/types";

import EspacosGestao from "./EspacosGestao";

export const metadata: Metadata = {
  title: "Espaços",
};

export default async function EspacosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let espacos: Espaco[];
  let reservas: Reserva[];
  try {
    [evento, espacos, reservas] = await Promise.all([
      getEvento(slug),
      getEspacos(slug),
      getReservas(slug),
    ]);
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar os espaços. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Espaços"
        subtitle={
          evento
            ? `${evento.nome} · salas e reservas`
            : "Salas, reservas e conflitos"
        }
      />
      <EspacosGestao eventoSlug={slug} espacos={espacos} reservas={reservas} />
    </>
  );
}
