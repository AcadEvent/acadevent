import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import type { ArquivoUpload } from './storage.interface';
import { STORAGE_SERVICE, StorageServiceBase } from './storage.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const EXTENSOES_PERMITIDAS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
]);

const MIMETYPES_PERMITIDOS = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function validarArquivo(file: ArquivoUpload) {
  if (!file) {
    throw new BadRequestException('Nenhum arquivo foi enviado.');
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (!EXTENSOES_PERMITIDAS.has(ext) || !MIMETYPES_PERMITIDOS.has(mime)) {
    throw new BadRequestException('Tipo de arquivo nao permitido.');
  }
}

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageServiceBase,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload de arquivo (PDF, imagens, slides) (RF10 / RNF05.4)',
  })
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
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();
        if (!EXTENSOES_PERMITIDAS.has(ext) || !MIMETYPES_PERMITIDOS.has(mime)) {
          return cb(
            new BadRequestException('Tipo de arquivo nao permitido.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadArquivo(@UploadedFile() file: ArquivoUpload) {
    validarArquivo(file);
    return this.storageService.salvarArquivo(file);
  }

  @ApiOperation({ summary: 'Recuperar arquivo armazenado' })
  @Get('arquivos/:subpasta/:nome')
  obterArquivo(
    @Param('subpasta') subpasta: string,
    @Param('nome') nome: string,
    @Res() res: Response,
  ) {
    let decodedSubpasta = subpasta;
    let decodedNome = nome;
    try {
      decodedSubpasta = decodeURIComponent(subpasta);
      decodedNome = decodeURIComponent(nome);
    } catch {
      throw new ForbiddenException('Acesso negado.');
    }

    if (
      subpasta.includes('..') ||
      nome.includes('..') ||
      decodedSubpasta.includes('..') ||
      decodedNome.includes('..') ||
      subpasta.toLowerCase().includes('%2e%2e') ||
      nome.toLowerCase().includes('%2e%2e') ||
      decodedSubpasta.includes('\0') ||
      decodedNome.includes('\0')
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads');
    const caminho = path.resolve(uploadDir, decodedSubpasta, decodedNome);

    if (!caminho.startsWith(uploadDir + path.sep)) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (!fs.existsSync(caminho)) {
      throw new NotFoundException('Arquivo nao encontrado.');
    }
    return res.sendFile(caminho);
  }
}
