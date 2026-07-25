import { IsInt, IsNotEmpty } from 'class-validator';

export class InscreverAtividadeDto {
  @IsInt()
  @IsNotEmpty()
  id_atividade: number;
}
