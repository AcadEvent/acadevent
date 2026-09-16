import { IsInt } from 'class-validator';

export class EmitirCertificadoAtividadeDto {
  @IsInt()
  id_edicao: number;

  @IsInt()
  id_atividade: number;

  @IsInt()
  id_usuario: number;
}
