import { IsString } from 'class-validator';

export class ValidarQrCodeDto {
  @IsString()
  url_qrcode: string;
}
