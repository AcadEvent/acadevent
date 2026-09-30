/**
 * ROTA: /gerenciar/[slug]/inventario
 * OWNER: Arthur   RF: RF08.1–3   PRIORIDADE: MVP
 * PROPÓSITO: Itens de inventário do evento — cadastro, retirada/devolução e
 *   alerta de estoque baixo (disponível ≤ mínima).
 * COMPONENTES: PageHeader, Table + Dialog (InventarioGestao), Alert
 * DADOS: getEvento(slug), getItensInventario(slug) (via @/lib/api)
 * ESTADOS: erro (Alert); vazio/alerta dentro do componente
 * DONE: responsivo, tokens do tema, alerta de estoque visível.
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import { getEvento, getItensInventario } from "@/lib/api";
import type { Evento, ItemInventario } from "@/lib/types";

import InventarioGestao from "./InventarioGestao";

export const metadata: Metadata = {
  title: "Inventário",
};

export default async function InventarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let itens: ItemInventario[];
  try {
    [evento, itens] = await Promise.all([
      getEvento(slug),
      getItensInventario(slug),
    ]);
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar o inventário. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Inventário"
        subtitle={
          evento ? `${evento.nome} · estoque e alertas` : "Estoque e alertas"
        }
      />
      <InventarioGestao eventoSlug={slug} itens={itens} />
    </>
  );
}
