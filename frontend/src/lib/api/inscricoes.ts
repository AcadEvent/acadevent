/**
 * Domínio: Inscrições e pagamentos — acesso a dados (mock por enquanto).
 * Ver docs/arquitetura-frontend.md §4. Não importar de src/lib/mock nas páginas.
 */
import type {
  CupomAplicado,
  InscricaoEdicao,
  LoteIngresso,
  NovaInscricao,
  ResultadoCheckin,
  StatusPagamento,
} from "@/lib/types";
import { mockCupons, mockInscricoes } from "@/lib/mock/inscricoes";
import { ErroRequisicao, fake, requestAutenticado } from "./_client";
import { API_URL } from "./_client";

interface LoteApi {
  id_lote: number;
  id_edicao: number;
  nome_lote: string;
  preco: string | number;
  numero_max_ingressos: number;
  data_abertura_lote?: string | null;
  data_encerramento_lote?: string | null;
}

function toLote(l: LoteApi): LoteIngresso {
  return {
    id: String(l.id_lote),
    eventoSlug: String(l.id_edicao),
    nome: l.nome_lote,
    preco: typeof l.preco === "string" ? Number(l.preco) : l.preco,
    abertura: l.data_abertura_lote ?? undefined,
    encerramento: l.data_encerramento_lote ?? undefined,
    vagas: l.numero_max_ingressos,
  };
}

/**
 * Lotes de ingresso da edição (RF04.2). GET /inscricoes/lotes/edicao/:id é
 * público (a vitrine de inscrição é aberta). `vagasRestantes` não é exposto
 * pela API ainda, então cai em `vagas` (numero_max_ingressos).
 */
export async function getLotes(idEdicao: number): Promise<LoteIngresso[]> {
  const res = await fetch(`${API_URL}/inscricoes/lotes/edicao/${idEdicao}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Não foi possível carregar os lotes.");
  const dados = (await res.json()) as LoteApi[];
  return dados.map(toLote);
}

export interface NovoLote {
  nome: string;
  preco: number;
  vagas: number;
  abertura?: string;
  encerramento?: string;
}

/** Cria um lote de ingresso na edição (RF04.2, organizador). */
export async function criarLote(
  token: string,
  idEdicao: number,
  input: NovoLote,
): Promise<LoteIngresso> {
  const body: Record<string, unknown> = {
    id_edicao: idEdicao,
    nome_lote: input.nome,
    preco: input.preco,
    numero_max_ingressos: input.vagas,
  };
  if (input.abertura) body.data_abertura_lote = input.abertura;
  if (input.encerramento) body.data_encerramento_lote = input.encerramento;
  const l = await requestAutenticado<LoteApi>("/inscricoes/lotes", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return toLote(l);
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

interface InscricaoApi {
  inscricao: {
    id_inscricao_edicao: number;
    status?: string | null;
    url_qrcode?: string | null;
  };
  pagamento?: { valor?: string | number | null } | null;
}

/**
 * Registra a inscrição na edição (RF04.2–4). POST /inscricoes é autenticado: o
 * participante atual vem do token. O backend valida lote/cupom e já cria um
 * pagamento (pendente, ou confirmado se gratuito). Devolve a inscrição criada —
 * não há endpoint de releitura (ver #121), então o recibo usa este retorno.
 */
export async function criarInscricao(
  token: string,
  input: NovaInscricao,
): Promise<ResultadoInscricao> {
  try {
    const r = await requestAutenticado<InscricaoApi>("/inscricoes", token, {
      method: "POST",
      body: JSON.stringify({
        id_lote: Number(input.loteId),
        ...(input.cupom ? { codigo_cupom: input.cupom.trim() } : {}),
      }),
    });

    const statusPagamento: StatusPagamento =
      (r.inscricao.status ?? "").toLowerCase() === "confirmada"
        ? "confirmado"
        : "pendente";
    const valor = r.pagamento?.valor != null ? Number(r.pagamento.valor) : 0;
    const agora = new Date().toISOString();

    const inscricao: InscricaoEdicao = {
      id: String(r.inscricao.id_inscricao_edicao),
      codigo: r.inscricao.url_qrcode ?? String(r.inscricao.id_inscricao_edicao),
      eventoSlug: input.eventoSlug,
      participante: input.participante ?? "Participante",
      statusPagamento,
      loteId: input.loteId,
      valor,
      metodoPagamento: input.metodoPagamento,
      atividadesIds: input.atividadesIds,
      criadaEm: agora,
      pagaEm: statusPagamento === "confirmado" ? agora : undefined,
    };
    return { ok: true, inscricao };
  } catch (e) {
    const erro =
      e instanceof ErroRequisicao
        ? e.message
        : "Não foi possível concluir a inscrição. Tente novamente.";
    return { ok: false, erro };
  }
}

export function getInscricao(id: string): Promise<InscricaoEdicao | null> {
  return fake(mockInscricoes.find((i) => i.id === id) ?? null);
}

// ── Gestão (organizador) ──────────────────────────────────────────────────────

/** Inscrições de um evento, mais recentes primeiro (RF04.1). */
export function getInscricoesDoEvento(
  eventoSlug: string,
): Promise<InscricaoEdicao[]> {
  return fake(
    mockInscricoes
      .filter((i) => i.eventoSlug === eventoSlug)
      .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)),
  );
}

/**
 * Confirmação manual de pagamento pelo organizador (RF04.5). Só faz efeito sobre
 * inscrições pendentes; devolve a inscrição atualizada.
 */
export function confirmarPagamento(id: string): Promise<InscricaoEdicao> {
  const inscricao = mockInscricoes.find((i) => i.id === id);
  if (!inscricao) {
    throw new Error("Inscrição não encontrada.");
  }
  if (inscricao.statusPagamento === "pendente") {
    inscricao.statusPagamento = "confirmado";
    inscricao.pagaEm = new Date().toISOString();
  }
  return fake(inscricao);
}

/** Check-ins já realizados (por id de inscrição). Vive só na memória do servidor. */
const checkinsRealizados = new Set<string>();

/**
 * Valida um check-in por código na portaria (RF04.8). A primeira validação de um
 * código confirmado dá certo; a repetição é rejeitada (evita reentrada).
 */
export function validarCheckin(
  eventoSlug: string,
  codigo: string,
): Promise<ResultadoCheckin> {
  const normalizado = codigo.trim().toUpperCase();
  const inscricao = mockInscricoes.find(
    (i) =>
      i.eventoSlug === eventoSlug &&
      (i.codigo ?? i.id).toUpperCase() === normalizado,
  );

  if (!inscricao) {
    return fake({
      ok: false,
      motivo: "nao_encontrado",
      mensagem: "Código não encontrado neste evento.",
    });
  }
  if (inscricao.statusPagamento !== "confirmado") {
    return fake({
      ok: false,
      motivo: "nao_confirmado",
      mensagem: "Inscrição sem pagamento confirmado — check-in não liberado.",
    });
  }
  if (checkinsRealizados.has(inscricao.id)) {
    return fake({
      ok: false,
      motivo: "ja_validado",
      mensagem: `Check-in já realizado para ${inscricao.participante}.`,
    });
  }

  checkinsRealizados.add(inscricao.id);
  return fake({
    ok: true,
    participante: inscricao.participante,
    codigo: inscricao.codigo ?? inscricao.id,
  });
}
