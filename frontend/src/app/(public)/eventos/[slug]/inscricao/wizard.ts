/**
 * Constantes compartilhadas pelos passos do wizard de inscrição
 * (/eventos/[slug]/inscricao e suas sub-rotas). Ficam aqui — e não em cada
 * page.tsx — para que o Stepper e as mensagens de bloqueio não divirjam entre os
 * passos. Ver docs/atribuicoes.md e docs/arquitetura-frontend.md §7.
 */
import type { StatusInscricao } from "@/lib/types";

/**
 * Guarda de sessão do fluxo de inscrição (RF02.1.2). Segue a mesma convenção do
 * src/proxy.ts: enquanto o contrato de auth com o backend não existe,
 * `getSession()` sempre devolve null — então o gate fica DESLIGADO para o time
 * conseguir percorrer o fluxo com os dados mock.
 *
 * TODO(auth): ligar junto com o AUTH_ENABLED do src/proxy.ts.
 */
export const AUTH_ENABLED = false;

/** Passos do wizard de inscrição — 4 de no máximo 5 (RNF04.4). */
export const PASSOS = ["Dados", "Atividades", "Pagamento", "Confirmação"];

/** Motivo do bloqueio quando as inscrições não estão abertas (RF01.5.3). */
export const BLOQUEIO: Record<
  Exclude<StatusInscricao, "abertas">,
  { titulo: string; texto: string; severidade: "info" | "warning" | "error" }
> = {
  em_breve: {
    titulo: "Inscrições ainda não abriram",
    texto:
      "As inscrições deste evento serão liberadas em breve. Acompanhe a página do evento para ser avisado.",
    severidade: "info",
  },
  encerradas: {
    titulo: "Inscrições encerradas",
    texto: "O período de inscrições deste evento já terminou.",
    severidade: "warning",
  },
  esgotadas: {
    titulo: "Vagas esgotadas",
    texto:
      "Todas as vagas deste evento foram preenchidas. Não é possível concluir a inscrição.",
    severidade: "error",
  },
};
