/**
 * Domínio: Inscrições e pagamentos — acesso a dados (mock por enquanto).
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 */
import type { LoteIngresso } from "@/lib/types";
import { mockLotes } from "@/lib/mock/inscricoes";
import { fake } from "./_client";

/** Lotes de ingresso da edição, do mais antigo para o mais recente (RF04.2). */
export function getLotes(eventoSlug: string): Promise<LoteIngresso[]> {
  return fake(mockLotes.filter((l) => l.eventoSlug === eventoSlug));
}
