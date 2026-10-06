"use server";

/**
 * Lista os eventos que o usuário autenticado organiza (RF03.2). Resolve o JWT do
 * cookie httpOnly e chama GET /eventos/gerenciar/meus. Sem sessão → lista vazia
 * (o layout do grupo já exige login). Erros propagam para o estado de erro da UI.
 */
import { getEventosGerenciaveis } from "@/lib/api";
import { getToken } from "@/lib/auth/session";
import type { Evento } from "@/lib/types";

export async function listarMeusEventosAction(): Promise<Evento[]> {
  const token = await getToken();
  if (!token) return [];
  return getEventosGerenciaveis(token);
}
