/**
 * ROTA: /gerenciar/[slug]/atividades
 * OWNER: Arthur   RF: RF05.1, RF05.4, RF03.2.9   PRIORIDADE: MVP
 * PROPÓSITO: Gestão de atividades — criar atividade e associar ministrante.
 * COMPONENTES: PageHeader, Table + Dialog (AtividadesGestao)
 * DADOS: getEvento(slug) + getCronograma(idEdicao) (via @/lib/api). Escritas via
 *   Server Actions (./actions.ts), protegidas por JWT (organizador/admin).
 * ESTADOS: erro (Alert); vazio dentro do componente.
 * DONE: responsivo, tokens do tema. NOTA: as escritas exigem sessão de
 *   organizador (401/403 até o login com o banco semeado funcionar).
 */
import type { Metadata } from "next";

import Alert from "@mui/material/Alert";

import PageHeader from "@/components/layout/PageHeader";
import { getCronograma, getEvento } from "@/lib/api";
import type { Atividade, Evento } from "@/lib/types";

import AtividadesGestao from "./AtividadesGestao";

export const metadata: Metadata = { title: "Atividades" };

export default async function AtividadesGestaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let evento: Evento | null;
  let atividades: Atividade[];
  try {
    evento = await getEvento(slug);
    atividades =
      evento?.idEdicao != null ? await getCronograma(evento.idEdicao) : [];
  } catch {
    return (
      <Alert severity="error">
        Não foi possível carregar as atividades. Tente novamente mais tarde.
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
        title="Atividades"
        subtitle={`${evento.nome} · criação e ministrantes`}
      />
      <AtividadesGestao
        slug={slug}
        idEdicao={evento.idEdicao}
        atividades={atividades}
      />
    </>
  );
}
