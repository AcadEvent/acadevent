/**
 * Domínio: Materiais / Storage (RF10 / RNF05.4) — acesso a dados.
 * Consome POST /storage/upload e GET /storage/arquivos/:sub/:nome (issue #88/#89).
 * Sem mock/`fake()`. Ver docs/arquitetura-frontend.md §4.
 *
 * NOTA (limitação do backend): o storage é genérico — não há endpoint para
 * LISTAR materiais por atividade nem vínculo material↔atividade, e o download
 * (/storage/arquivos) não é protegido. A UI cobre upload + link; a lista e o
 * controle de acesso por inscrição dependem de evolução do backend.
 */
import type { ArquivoSalvo } from "@/lib/types";

import { API_URL, ErroRequisicao, mensagemDoErro } from "./_client";

interface ArquivoSalvoApi {
  nome_original: string;
  nome_armazenado: string;
  caminho_relativo: string;
  url: string;
  tamanho?: number | null;
}

function toArquivo(a: ArquivoSalvoApi): ArquivoSalvo {
  return {
    nomeOriginal: a.nome_original,
    nomeArmazenado: a.nome_armazenado,
    caminhoRelativo: a.caminho_relativo,
    url: a.url,
    tamanho: a.tamanho ?? undefined,
  };
}

/** URL absoluta para baixar um arquivo já armazenado. */
export function urlArquivo(caminhoRelativoOuUrl: string): string {
  if (caminhoRelativoOuUrl.startsWith("http")) return caminhoRelativoOuUrl;
  if (caminhoRelativoOuUrl.startsWith("/storage/")) {
    return `${API_URL}${caminhoRelativoOuUrl}`;
  }
  return `${API_URL}/storage/arquivos/${caminhoRelativoOuUrl}`;
}

/**
 * Faz upload de um arquivo (RF10). Multipart; o backend impõe 15MB e whitelist
 * de tipos (413/400 viram ErroRequisicao com a mensagem do backend).
 */
export async function uploadArquivo(
  token: string,
  file: File,
): Promise<ArquivoSalvo> {
  const form = new FormData();
  form.append("file", file);

  // Sem Content-Type manual: o fetch define o boundary do multipart.
  const res = await fetch(`${API_URL}/storage/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = await mensagemDoErro(res);
    throw new ErroRequisicao(msg ?? "Falha no upload do arquivo.", res.status);
  }
  return toArquivo((await res.json()) as ArquivoSalvoApi);
}
