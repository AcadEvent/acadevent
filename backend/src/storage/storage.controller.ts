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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

const ASSINATURAS_POR_EXTENSAO: Record<string, number[][]> = {
  '.pdf': [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  '.png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  '.jpg': [[0xff, 0xd8, 0xff]],
  '.jpeg': [[0xff, 0xd8, 0xff]],
  '.webp': [[0x52, 0x49, 0x46, 0x46]],
  '.doc': [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
  '.ppt': [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
  '.xls': [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
  '.docx': [[0x50, 0x4b, 0x03, 0x04]],
  '.pptx': [[0x50, 0x4b, 0x03, 0x04]],
  '.xlsx': [[0x50, 0x4b, 0x03, 0x04]],
};

function conteudoCompativel(file: ArquivoUpload, ext: string): boolean {
  const assinaturas = ASSINATURAS_POR_EXTENSAO[ext];
  const buffer = file.buffer;
  if (!assinaturas || !Buffer.isBuffer(buffer)) return false;
  const confere = assinaturas.some(
    (sig) =>
      buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte),
  );
  if (!confere) return false;
  if (ext === '.webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return true;
}

function validarArquivo(file: ArquivoUpload) {
  if (!file) {
    throw new BadRequestException('Nenhum arquivo foi enviado.');
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (!EXTENSOES_PERMITIDAS.has(ext) || !MIMETYPES_PERMITIDOS.has(mime)) {
    throw new BadRequestException('Tipo de arquivo nao permitido.');
  }

  if (!conteudoCompativel(file, ext)) {
    throw new BadRequestException(
      'Conteudo do arquivo nao corresponde a extensao informada.',
    );
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'ministrante', 'administrador')
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recuperar arquivo armazenado (requer login)' })
  @UseGuards(JwtAuthGuard)
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
