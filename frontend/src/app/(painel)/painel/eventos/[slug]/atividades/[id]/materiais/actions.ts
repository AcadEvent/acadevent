"use server";

/**
 * Server Action de upload de material da atividade (RF10). POST /storage/upload
 * é protegido por JWT: token httpOnly reenviado como Bearer. 15MB + whitelist.
 */
import type { ResultadoUpload } from "@/components/domain/MaterialUpload";
import { uploadArquivo, urlArquivo } from "@/lib/api";
import { ErroRequisicao } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";

export async function uploadMaterialAction(
  formData: FormData,
): Promise<ResultadoUpload> {
  const token = await getToken();
  if (!token) {
    return { ok: false, erro: "Entre na sua conta para enviar materiais." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erro: "Selecione um arquivo." };
  }
  try {
    const salvo = await uploadArquivo(token, file);
    return { ok: true, url: urlArquivo(salvo.url), nome: salvo.nomeOriginal };
  } catch (e) {
    const erro =
      e instanceof ErroRequisicao ? e.message : "Falha no upload do arquivo.";
    return { ok: false, erro };
  }
}
