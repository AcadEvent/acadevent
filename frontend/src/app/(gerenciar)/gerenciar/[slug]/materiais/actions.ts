"use server";

/**
 * Server Action de upload de material (RF10). POST /storage/upload é protegido
 * por JWT: lemos o token httpOnly e reenviamos como Bearer. O backend impõe
 * limite de 15MB e whitelist de tipos (413/400 → mensagem amigável).
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
    return { ok: false, erro: "Faça login como organizador para enviar." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erro: "Selecione um arquivo." };
  }
  try {
    const salvo = await uploadArquivo(token, file);
    return {
      ok: true,
      url: urlArquivo(salvo.url),
      nome: salvo.nomeOriginal,
    };
  } catch (e) {
    const erro =
      e instanceof ErroRequisicao ? e.message : "Falha no upload do arquivo.";
    return { ok: false, erro };
  }
}
