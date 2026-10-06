/**
 * Domínio: Logs de auditoria (RF16) — acesso a dados.
 * Consome GET /admin/logs (issue #88), protegido por JWT + RBAC (administrador).
 * Sem mock/`fake()`. Ver docs/arquitetura-frontend.md §4.
 */
import type { RegistroLog } from "@/lib/types";

import { requestAutenticado } from "./_client";

interface RegistroLogApi {
  metodo: string;
  url: string;
  status_code: number;
  duracao_ms: number;
  data: string;
  usuario_id?: number | null;
}

function toRegistroLog(l: RegistroLogApi): RegistroLog {
  return {
    metodo: l.metodo,
    url: l.url,
    statusCode: l.status_code,
    duracaoMs: l.duracao_ms,
    data: l.data,
    usuarioId: l.usuario_id ?? undefined,
  };
}

/** Logs recentes de auditoria (RF16.3 — administrador). */
export async function getLogs(
  token: string,
  limite = 100,
): Promise<RegistroLog[]> {
  const dados = await requestAutenticado<RegistroLogApi[]>(
    `/admin/logs?limite=${limite}`,
    token,
  );
  return dados.map(toRegistroLog);
}
