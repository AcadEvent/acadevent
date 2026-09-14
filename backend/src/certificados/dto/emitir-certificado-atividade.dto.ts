import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class EmitirCertificadoAtividadeDto {
  @IsInt()
  id_edicao: number;

  @IsInt()
  id_atividade: number;

  @IsInt()
  id_usuario: number;

  @IsString()
  @IsNotEmpty()
  codigo_autenticidade: string;
}
