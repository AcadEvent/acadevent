import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import type { ArquivoUpload } from './storage.interface';
import {
  STORAGE_SERVICE,
  StorageServiceBase,
} from './storage.interface';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageServiceBase,
  ) {}

  @ApiOperation({ summary: 'Upload de arquivo (PDF, imagens, slides) (RF10 / RNF05.4)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async uploadArquivo(@UploadedFile() file: ArquivoUpload) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }
    return this.storageService.salvarArquivo(file);
  }

  @ApiOperation({ summary: 'Recuperar arquivo armazenado' })
  @Get('arquivos/:subpasta/:nome')
  obterArquivo(
    @Param('subpasta') subpasta: string,
    @Param('nome') nome: string,
    @Res() res: Response,
  ) {
    const caminho = path.resolve(process.cwd(), 'uploads', subpasta, nome);
    if (!fs.existsSync(caminho)) {
      throw new NotFoundException('Arquivo nao encontrado.');
    }
    return res.sendFile(caminho);
  }
}
