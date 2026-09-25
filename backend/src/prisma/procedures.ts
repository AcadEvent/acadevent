import { Prisma } from '@prisma/client';
import type {
  Certificado,
  InscricaoEdicao,
  RegistroInventario,
  Reserva,
} from '@prisma/client';
import { queryProcedure } from './map-procedure-error';

type Tx =
  | Prisma.TransactionClient
  | { $queryRaw: Prisma.TransactionClient['$queryRaw'] };

export type AvaliacaoTrabalhoRow = {
  id_avaliacao: number;
  id_trabalho: number;
  status: string | null;
  descricao_parecer: string | null;
  nota: Prisma.Decimal | null;
  data_avaliacao: Date | null;
  data_submissao: Date | null;
  data_aprovacao: Date | null;
  id_correcao: number;
  id_parecerista: number;
};

function firstRow<T>(rows: T[], routine: string): T {
  const row = rows[0];
  if (!row) {
    throw new Error(`Erro: A rotina ${routine} nao retornou registros.`);
  }
  return row;
}

export async function spRetirarInventario(
  tx: Tx,
  params: {
    id_item: number;
    id_organizador: number;
    quantidade: number;
    id_ministrante?: number | null;
  },
): Promise<RegistroInventario> {
  const rows = await queryProcedure(
    tx.$queryRaw<RegistroInventario[]>`
      SELECT * FROM sp_retirar_inventario(
        ${params.id_item}::integer,
        ${params.id_organizador}::integer,
        ${params.quantidade}::integer,
        ${params.id_ministrante ?? null}::integer
      )
    `,
  );
  return firstRow(rows, 'sp_retirar_inventario');
}

export async function spReservarEspaco(
  tx: Tx,
  params: {
    id_atividade: number;
    id_espaco: number;
    data_inicio: Date;
    data_final: Date;
  },
): Promise<Reserva> {
  const rows = await queryProcedure(
    tx.$queryRaw<Reserva[]>`
      SELECT * FROM sp_reservar_espaco(
        ${params.id_atividade}::integer,
        ${params.id_espaco}::integer,
        ${params.data_inicio}::timestamp,
        ${params.data_final}::timestamp
      )
    `,
  );
  return firstRow(rows, 'sp_reservar_espaco');
}

export async function spRealizarInscricaoEdicao(
  tx: Tx,
  params: {
    id_participante: number;
    id_lote: number;
    id_cupom?: number | null;
  },
): Promise<InscricaoEdicao> {
  const rows = await queryProcedure(
    tx.$queryRaw<InscricaoEdicao[]>`
      SELECT * FROM sp_realizar_inscricao_edicao(
        ${params.id_participante}::integer,
        ${params.id_lote}::integer,
        ${params.id_cupom ?? null}::integer
      )
    `,
  );
  return firstRow(rows, 'sp_realizar_inscricao_edicao');
}

export async function spRegistrarAvaliacaoTrabalho(
  tx: Tx,
  params: {
    id_parecerista: number;
    id_trabalho: number;
    status: string;
    parecer: string;
    nota: Prisma.Decimal | number;
  },
): Promise<AvaliacaoTrabalhoRow> {
  const rows = await queryProcedure(
    tx.$queryRaw<AvaliacaoTrabalhoRow[]>`
      SELECT * FROM sp_registrar_avaliacao_trabalho(
        ${params.id_parecerista}::integer,
        ${params.id_trabalho}::integer,
        ${params.status}::varchar,
        ${params.parecer}::text,
        ${params.nota}::numeric
      )
    `,
  );
  return firstRow(rows, 'sp_registrar_avaliacao_trabalho');
}

export async function spEmitirCertificadoAtividade(
  tx: Tx,
  params: {
    id_edicao: number;
    id_atividade: number;
    id_usuario: number;
    codigo_autenticidade: string;
  },
): Promise<Certificado> {
  const rows = await queryProcedure(
    tx.$queryRaw<Certificado[]>`
      SELECT * FROM sp_emitir_certificado_atividade(
        ${params.id_edicao}::integer,
        ${params.id_atividade}::integer,
        ${params.id_usuario}::integer,
        ${params.codigo_autenticidade}::varchar
      )
    `,
  );
  return firstRow(rows, 'sp_emitir_certificado_atividade');
}
