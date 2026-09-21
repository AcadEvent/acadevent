import { IsInt, IsOptional } from 'class-validator';

export class EmitirCertificadoAtividadeDto {
  @IsInt()
  id_edicao: number;

  @IsInt()
  id_atividade: number;

  @IsInt()
  @IsOptional()
  id_usuario?: number;
}
