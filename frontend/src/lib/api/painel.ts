/**
 * Domínio: Painel do usuário. Acesso a dados (mock por enquanto).
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 */
import type { Notificacao, PainelEvento } from "@/lib/types";
import { mockNotificacoes, mockPainelEventos } from "@/lib/mock/painel";
import { fake } from "./_client";

/**
 * Visão geral de um evento no painel pessoal (RF03.1.1). Devolve null quando o
 * slug não existe ou o usuário não participa daquele evento.
 */
export function getPainelEvento(slug: string): Promise<PainelEvento | null> {
  const evento = mockPainelEventos.find((e) => e.slug === slug);
  if (!evento) {
    return fake(null);
  }

  return fake({
    ...evento,
    atividades: [...evento.atividades].sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
    ),
  });
}

/** Avisos do usuário, do mais recente para o mais antigo (RF03.1.5). */
export function getNotificacoes(): Promise<Notificacao[]> {
  return fake(
    [...mockNotificacoes].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    ),
  );
}
