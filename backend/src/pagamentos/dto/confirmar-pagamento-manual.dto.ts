import { IsInt } from 'class-validator';

export class ConfirmarPagamentoManualDto {
  @IsInt()
  id_inscricao_edicao: number;
}
