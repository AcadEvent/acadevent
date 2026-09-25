import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WebhookPagamentoDto {
  @IsString()
  @IsNotEmpty()
  gateway_id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsString()
  @IsOptional()
  assinatura?: string;
}
