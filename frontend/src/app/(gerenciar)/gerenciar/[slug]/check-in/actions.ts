"use server";

/**
 * Valida o check-in por QR Code (RF04.8). POST /inscricoes/validar-qrcode é
 * autenticado (organizador/comissão/admin): o token da sessão vai como Bearer.
 * O backend credencia a inscrição confirmada e recusa código inexistente (404),
 * inscrição não confirmada (400) ou já credenciada (400).
 */
import { ErroRequisicao, requestAutenticado } from "@/lib/api/_client";
import { getToken } from "@/lib/auth/session";
import type { ResultadoCheckin } from "@/lib/types";

interface ValidarQrCodeResp {
  inscricao?: {
    url_qrcode?: string | null;
    participante?: { usuario?: { nome?: string | null } | null } | null;
  } | null;
}

export async function validarCheckinAction(
  _eventoSlug: string,
  codigo: string,
): Promise<ResultadoCheckin> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      motivo: "nao_encontrado",
      mensagem: "Sua sessão expirou. Entre novamente.",
    };
  }

  try {
    const r = await requestAutenticado<ValidarQrCodeResp>(
      "/inscricoes/validar-qrcode",
      token,
      { method: "POST", body: JSON.stringify({ url_qrcode: codigo.trim() }) },
    );
    return {
      ok: true,
      participante: r.inscricao?.participante?.usuario?.nome ?? "Participante",
      codigo: r.inscricao?.url_qrcode ?? codigo.trim(),
    };
  } catch (e) {
    if (e instanceof ErroRequisicao) {
      // 404 → código inexistente; 400 → já credenciado ou não confirmado.
      const motivo: "nao_encontrado" | "ja_validado" | "nao_confirmado" =
        e.status === 400
          ? /utilizad|credenciad/i.test(e.message)
            ? "ja_validado"
            : "nao_confirmado"
          : "nao_encontrado";
      return { ok: false, motivo, mensagem: e.message };
    }
    return {
      ok: false,
      motivo: "nao_encontrado",
      mensagem: "Não foi possível validar o check-in. Tente novamente.",
    };
  }
}
