import { IsInt } from 'class-validator';

export class AssociarMinistranteDto {
  @IsInt()
  id_atividade: number;

  @IsInt()
  id_ministrante: number;
}
