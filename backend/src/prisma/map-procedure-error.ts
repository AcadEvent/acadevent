import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function mapProcedureError(error: unknown): never {
  const message = extractMessage(error);
  const sqlMessage = message.match(/Erro:.*$/m)?.[0] ?? message;

  if (/reserva conflitante|conflito de agendamento/i.test(sqlMessage)) {
    throw new ConflictException(sqlMessage);
  }

  if (sqlMessage.includes('Erro:')) {
    throw new BadRequestException(sqlMessage);
  }

  throw error;
}

export async function queryProcedure<T>(query: Promise<T>): Promise<T> {
  try {
    return await query;
  } catch (error) {
    mapProcedureError(error);
  }
}
