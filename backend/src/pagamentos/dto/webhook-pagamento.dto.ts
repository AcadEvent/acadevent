import { IsNotEmpty, IsString } from 'class-validator';

export class WebhookPagamentoDto {
  @IsString()
  @IsNotEmpty()
  gateway_id: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
