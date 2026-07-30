import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class ReservarEspacoDto {
  @IsInt()
  id_atividade: number;

  @IsInt()
  id_espaco: number;

  @Type(() => Date)
  @IsDate()
  data_inicio: Date;

  @Type(() => Date)
  @IsDate()
  data_final: Date;
}
