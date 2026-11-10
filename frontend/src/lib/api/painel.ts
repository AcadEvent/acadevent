/**
 * Domínio: Painel do usuário. Acesso a dados (visão por evento via API; avisos
 * ainda em mock). Ver docs/arquitetura-frontend.md §4. Não importar de
 * src/lib/mock nas páginas.
 */
import type { Notificacao, PainelEvento } from "@/lib/types";
import { mockNotificacoes } from "@/lib/mock/painel";
import { API_URL, fake } from "./_client";

/**
 * Visão geral de um evento no painel pessoal (GET
 * /eventos/participante/meus/:slug, RF03.1.1). Devolve null quando o slug não
 * existe ou o usuário não participa daquele evento. Precisa do Bearer da sessão.
 */
export async function getPainelEvento(
  slug: string,
  token: string,
): Promise<PainelEvento | null> {
  const res = await fetch(
    `${API_URL}/eventos/participante/meus/${encodeURIComponent(slug)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Não foi possível carregar o painel do evento.");
  return (await res.json()) as PainelEvento;
}

/** Avisos do usuário, do mais recente para o mais antigo (RF03.1.5). */
export function getNotificacoes(): Promise<Notificacao[]> {
  return fake(
    [...mockNotificacoes].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    ),
  );
}
