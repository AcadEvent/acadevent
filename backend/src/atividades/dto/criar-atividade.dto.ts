import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CriarAtividadeDto {
  @IsInt()
  id_edicao: number;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  tipo_atividade?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsInt()
  @Min(1)
  carga_horario: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_abertura_atividade?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_encerramento_atividade?: Date;
}
