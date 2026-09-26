/**
 * Domínio: Inscrições e pagamentos — acesso a dados (mock por enquanto).
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 */
import type {
  CupomAplicado,
  InscricaoEdicao,
  LoteIngresso,
  NovaInscricao,
} from "@/lib/types";
import { mockCupons, mockInscricoes, mockLotes } from "@/lib/mock/inscricoes";
import { fake } from "./_client";

/** Lotes de ingresso da edição, do mais antigo para o mais recente (RF04.2). */
export function getLotes(eventoSlug: string): Promise<LoteIngresso[]> {
  return fake(mockLotes.filter((l) => l.eventoSlug === eventoSlug));
}

/** Vagas ainda disponíveis no lote. */
export function vagasDoLote(lote: LoteIngresso): number {
  return lote.vagasRestantes ?? lote.vagas;
}

/** Lote dentro do período de validade e com vaga — pode ser comprado agora. */
export function loteDisponivel(lote: LoteIngresso, agora = new Date()): boolean {
  const abre = lote.abertura ? new Date(lote.abertura) : null;
  const fecha = lote.encerramento ? new Date(lote.encerramento) : null;
  return (
    (!abre || abre <= agora) && (!fecha || fecha >= agora) && vagasDoLote(lote) > 0
  );
}

/** Desconto em R$ que um cupom gera sobre um preço — nunca maior que o preço. */
export function calcularDesconto(
  cupom: Pick<CupomAplicado, "tipo" | "valor">,
  preco: number,
): number {
  const bruto =
    cupom.tipo === "percentual" ? (preco * cupom.valor) / 100 : cupom.valor;
  return Math.min(preco, Math.round(bruto * 100) / 100);
}

export type ResultadoCupom =
  | { ok: true; cupom: CupomAplicado }
  | { ok: false; erro: string };

/** Valida o cupom na edição e calcula o desconto sobre o preço do lote (RF04.3). */
export function aplicarCupom(
  eventoSlug: string,
  codigo: string,
  preco: number,
): Promise<ResultadoCupom> {
  const normalizado = codigo.trim().toUpperCase();
  const cupom = mockCupons.find(
    (c) => c.eventoSlug === eventoSlug && c.codigo === normalizado,
  );

  if (!cupom) return fake({ ok: false, erro: "Cupom inválido para este evento." });
  if (cupom.validoAte && new Date(cupom.validoAte) < new Date()) {
    return fake({ ok: false, erro: "Este cupom expirou." });
  }
  if (cupom.usosRestantes <= 0) {
    return fake({ ok: false, erro: "Este cupom atingiu o limite de usos." });
  }

  return fake({
    ok: true,
    cupom: {
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: cupom.valor,
      desconto: calcularDesconto(cupom, preco),
    },
  });
}

/**
 * Tokens de checkout emitidos e ainda não usados (RF04.9). Cada abertura do
 * passo de pagamento recebe um; ele só vale para UMA inscrição, o que impede o
 * reenvio automatizado do mesmo formulário.
 * TODO(api): mover para o backend junto com CAPTCHA e rate limiting.
 */
const tokensCheckout = new Set<string>();

export function emitirTokenCheckout(): Promise<string> {
  const token = crypto.randomUUID();
  tokensCheckout.add(token);
  return fake(token);
}

export type ResultadoInscricao =
  | { ok: true; inscricao: InscricaoEdicao }
  | { ok: false; erro: string };

/**
 * Registra a inscrição na edição (RF04.2–4). Revalida lote, cupom e token no
 * "servidor" — o que veio do navegador não é confiável. Inscrição gratuita já
 * nasce confirmada; paga fica pendente até a confirmação do pagamento (RF04.5).
 */
export async function criarInscricao(
  input: NovaInscricao,
): Promise<ResultadoInscricao> {
  if (!tokensCheckout.has(input.tokenCheckout)) {
    return {
      ok: false,
      erro: "Sua sessão de pagamento expirou. Recarregue a página e tente de novo.",
    };
  }

  const lote = mockLotes.find(
    (l) => l.id === input.loteId && l.eventoSlug === input.eventoSlug,
  );
  if (!lote || !loteDisponivel(lote)) {
    return { ok: false, erro: "O lote escolhido não está mais disponível." };
  }

  let cupom: CupomAplicado | undefined;
  if (input.cupom) {
    const resultado = await aplicarCupom(input.eventoSlug, input.cupom, lote.preco);
    if (!resultado.ok) return resultado;
    cupom = resultado.cupom;
  }

  const valor = Math.max(0, lote.preco - (cupom?.desconto ?? 0));
  if (valor > 0 && input.metodoPagamento === "gratuito") {
    return { ok: false, erro: "Escolha uma forma de pagamento." };
  }

  // Tudo validado: só agora o token é gasto e as vagas/usos são debitados, para
  // que um erro corrigível (ex.: cupom vencido) não obrigue a recarregar a página.
  // O delete é checado de novo porque dois envios simultâneos podem ter passado
  // pelo `has` lá em cima.
  if (!tokensCheckout.delete(input.tokenCheckout)) {
    return { ok: false, erro: "Esta inscrição já foi enviada." };
  }
  lote.vagasRestantes = vagasDoLote(lote) - 1;
  const registroCupom = mockCupons.find(
    (c) => c.eventoSlug === input.eventoSlug && c.codigo === cupom?.codigo,
  );
  if (registroCupom) registroCupom.usosRestantes -= 1;

  const agora = new Date().toISOString();
  const sequencial = String(mockInscricoes.length + 1).padStart(4, "0");
  // "sitc-2026" → "SITC26"
  const [sigla, ...resto] = input.eventoSlug.split("-");
  const ano = resto.find((p) => /^\d{4}$/.test(p))?.slice(2) ?? "";
  const prefixo = `${sigla.toUpperCase()}${ano}`;
  const inscricao: InscricaoEdicao = {
    id: `insc-${crypto.randomUUID().slice(0, 8)}`,
    codigo: `${prefixo}-${sequencial}`,
    eventoSlug: input.eventoSlug,
    participante: input.participante ?? "Participante",
    statusPagamento: valor === 0 ? "confirmado" : "pendente",
    loteId: lote.id,
    loteNome: lote.nome,
    valorBruto: lote.preco,
    cupom,
    valor,
    metodoPagamento: valor === 0 ? "gratuito" : input.metodoPagamento,
    atividadesIds: input.atividadesIds,
    criadaEm: agora,
    pagaEm: valor === 0 ? agora : undefined,
  };
  mockInscricoes.push(inscricao);

  // TODO(api): o backend dispara o e-mail de confirmação (RF09.1).
  return { ok: true, inscricao };
}

export function getInscricao(id: string): Promise<InscricaoEdicao | null> {
  return fake(mockInscricoes.find((i) => i.id === id) ?? null);
}
