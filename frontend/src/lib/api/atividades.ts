/**
 * Domínio: Atividades & Certificados (RF05 / RF11 / RF14) — acesso a dados.
 * Consome a API real da issue #86. Sem mock/`fake()`.
 *
 * Leituras públicas (cronograma, validar certificado, download) não exigem
 * sessão. As escritas (criar/associar/inscrever/chamada/emitir) são protegidas
 * por JWT no backend — recebem o `token` da sessão (auth/session.getToken) e o
 * reenviam como `Authorization: Bearer`. Ver docs/arquitetura-frontend.md §4.
 */
import type {
  Atividade,
  CertificadoValidado,
  Ministrante,
  ResultadoValidacaoCertificado,
  TipoAtividade,
} from "@/lib/types";

import { API_URL } from "./_client";

// ── Formas cruas do backend (snake_case) ─────────────────────────────────────

interface MinistranteApi {
  id_ministrante: number;
  biografia?: string | null;
  area_atuacao?: string | null;
  instituicao_origem?: string | null;
  url_foto?: string | null;
  usuario?: { nome?: string | null; email?: string | null } | null;
}

interface EspacoApi {
  nome_sala?: string | null;
  capacidade_max?: number | null;
  tipo_espaco?: string | null;
}

interface ReservaApi {
  data_inicio?: string | null;
  data_final?: string | null;
  espaco?: EspacoApi | null;
}

interface AtividadeApi {
  id_atividade: number;
  titulo: string;
  tipo_atividade?: string | null;
  descricao?: string | null;
  carga_horario?: number | null;
  data_abertura_atividade?: string | null;
  data_encerramento_atividade?: string | null;
  reservas?: ReservaApi[] | null;
  atividadesMinistrantes?: { ministrante?: MinistranteApi | null }[] | null;
}

const TIPO_MAP: Record<string, TipoAtividade> = {
  palestra: "palestra",
  minicurso: "minicurso",
  "mesa redonda": "mesa_redonda",
  mesa_redonda: "mesa_redonda",
  workshop: "workshop",
  oficina: "workshop",
  mostra: "mostra",
  maratona: "maratona",
};

function normalizarTipo(valor?: string | null): TipoAtividade {
  return TIPO_MAP[(valor ?? "").trim().toLowerCase()] ?? "outro";
}

/** Mapeia o ministrante embutido, SEM expor e-mail em página pública. */
function toMinistrante(m: MinistranteApi): Ministrante {
  return {
    id: String(m.id_ministrante),
    nome: m.usuario?.nome ?? "Ministrante",
    bio: m.biografia ?? undefined,
    instituicao: m.instituicao_origem ?? undefined,
    areaAtuacao: m.area_atuacao ?? undefined,
    fotoUrl: m.url_foto ?? undefined,
  };
}

function toAtividade(a: AtividadeApi): Atividade {
  const reserva = a.reservas?.[0];
  const ministrantes = (a.atividadesMinistrantes ?? [])
    .map((am) => am.ministrante)
    .filter((m): m is MinistranteApi => Boolean(m))
    .map(toMinistrante);

  return {
    id: String(a.id_atividade),
    titulo: a.titulo,
    descricao: a.descricao ?? undefined,
    tipo: normalizarTipo(a.tipo_atividade),
    tipoLabel: a.tipo_atividade ?? undefined,
    // O horário real vem da reserva de espaço; cai para as datas da atividade.
    inicio: reserva?.data_inicio ?? a.data_abertura_atividade ?? "",
    fim: reserva?.data_final ?? a.data_encerramento_atividade ?? "",
    cargaHoraria: a.carga_horario ?? undefined,
    local: reserva?.espaco?.nome_sala ?? undefined,
    capacidade: reserva?.espaco?.capacidade_max ?? undefined,
    ministrantesIds: ministrantes.map((m) => m.id),
    ministrantes,
  };
}

// ── Leituras públicas ────────────────────────────────────────────────────────

/** Cronograma público da edição, ordenado por início (RF05.2 / RF14). */
export async function getCronograma(idEdicao: number): Promise<Atividade[]> {
  const res = await fetch(
    `${API_URL}/atividades/cronograma/edicao/${idEdicao}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Não foi possível carregar o cronograma.");
  const dados = (await res.json()) as AtividadeApi[];
  return dados
    .map(toAtividade)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

interface ValidarCertificadoApi {
  valido?: boolean;
  certificado?: {
    codigo_autenticidade?: string | null;
    data_emissao?: string | null;
    nome_atividade?: string | null;
    carga_horario?: number | null;
    usuario?: { nome?: string | null; email?: string | null } | null;
    edicao?: { titulo_oficial?: string | null; sigla?: string | null } | null;
    atividade?: { titulo?: string | null; carga_horario?: number | null } | null;
  } | null;
}

/** Validação pública de autenticidade do certificado (RF11.7). */
export async function validarCertificado(
  codigo: string,
): Promise<ResultadoValidacaoCertificado> {
  const res = await fetch(
    `${API_URL}/certificados/${encodeURIComponent(codigo)}/validar`,
    { cache: "no-store" },
  );
  if (res.status === 404) return { valido: false };
  if (!res.ok) throw new Error("Não foi possível validar o certificado.");

  const data = (await res.json()) as ValidarCertificadoApi;
  const c = data.certificado;
  if (!data.valido || !c) return { valido: false };

  const certificado: CertificadoValidado = {
    codigo: c.codigo_autenticidade ?? codigo,
    nomeParticipante: c.usuario?.nome ?? "—",
    emailMascarado: c.usuario?.email ?? undefined,
    evento: c.edicao?.titulo_oficial ?? "—",
    sigla: c.edicao?.sigla ?? undefined,
    atividade: c.nome_atividade ?? c.atividade?.titulo ?? undefined,
    cargaHoraria: c.carga_horario ?? c.atividade?.carga_horario ?? undefined,
    emitidoEm: c.data_emissao ?? undefined,
  };
  return { valido: true, certificado };
}

/** URL de download do PDF do certificado (RF11.5). */
export function urlDownloadCertificado(codigo: string): string {
  return `${API_URL}/certificados/${encodeURIComponent(codigo)}/download`;
}

// ── Escritas autenticadas (Bearer) ───────────────────────────────────────────

/** Erro de API que preserva o status HTTP (ex.: 409 conflito de horário). */
export class ErroApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

async function postAutenticado<T>(
  caminho: string,
  token: string,
  corpo: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${caminho}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(corpo),
    cache: "no-store",
  });
  if (!res.ok) {
    // 409 = conflito de horário (contrato #75); repassamos a mensagem do backend.
    const msg = await res
      .json()
      .then((b: { message?: string | string[] }) =>
        Array.isArray(b?.message) ? b.message.join(" ") : b?.message,
      )
      .catch(() => undefined);
    throw new ErroApi(msg ?? "Falha na operação.", res.status);
  }
  return (await res.json()) as T;
}

/** Cria atividade na edição (RF05.1 — organizador/admin). */
export function criarAtividade(
  token: string,
  input: {
    idEdicao: number;
    titulo: string;
    tipoAtividade?: string;
    descricao?: string;
    cargaHoraria: number;
    inicio?: string;
    fim?: string;
  },
): Promise<unknown> {
  return postAutenticado("/atividades", token, {
    id_edicao: input.idEdicao,
    titulo: input.titulo,
    tipo_atividade: input.tipoAtividade,
    descricao: input.descricao,
    carga_horario: input.cargaHoraria,
    data_abertura_atividade: input.inicio,
    data_encerramento_atividade: input.fim,
  });
}

/** Associa um ministrante a uma atividade (RF05.4 — organizador/admin). */
export function associarMinistrante(
  token: string,
  idAtividade: number,
  idMinistrante: number,
): Promise<unknown> {
  return postAutenticado("/atividades/associar-ministrante", token, {
    id_atividade: idAtividade,
    id_ministrante: idMinistrante,
  });
}

/** Inscreve o participante autenticado na atividade; 409 = conflito (RF05.3). */
export function inscreverAtividade(
  token: string,
  idAtividade: number,
): Promise<unknown> {
  return postAutenticado("/atividades/inscrever", token, {
    id_atividade: idAtividade,
  });
}

/** Registra a chamada de presença de uma atividade (RF05.6). */
export function registrarChamada(
  token: string,
  presencas: { idInscricaoAtividade: number; status: "Presente" | "Ausente" }[],
): Promise<unknown> {
  return postAutenticado("/atividades/chamada", token, {
    presencas: presencas.map((p) => ({
      id_inscricao_atividade: p.idInscricaoAtividade,
      status: p.status,
    })),
  });
}

/** Emite o certificado de uma atividade (RF11.1). */
export function emitirCertificado(
  token: string,
  input: { idEdicao: number; idAtividade: number; idUsuario?: number },
): Promise<unknown> {
  return postAutenticado("/certificados/atividade", token, {
    id_edicao: input.idEdicao,
    id_atividade: input.idAtividade,
    id_usuario: input.idUsuario,
  });
}
