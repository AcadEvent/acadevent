"use server";

import { validarCheckin } from "@/lib/api";
import type { ResultadoCheckin } from "@/lib/types";

/**
 * Valida o check-in no servidor, para o registro de entrada viver no mesmo
 * processo que o mock das inscrições.
 */
export async function validarCheckinAction(
  eventoSlug: string,
  codigo: string,
): Promise<ResultadoCheckin> {
  return validarCheckin(eventoSlug, codigo);
}
