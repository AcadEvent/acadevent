import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { spRegistrarAvaliacaoTrabalho } from '../prisma/procedures';
import { RegistrarAvaliacaoDto } from './dto/registrar-avaliacao.dto';

@Injectable()
export class SubmissoesService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarAvaliacao(dto: RegistrarAvaliacaoDto, idUsuario: number) {
    const trabalho = await this.prisma.trabalhoAcademico.findUnique({
      where: { id_trabalho: dto.id_trabalho },
      include: {
        submissoes: {
          include: {
            autor: true,
          },
        },
      },
    });

    if (!trabalho) {
      throw new NotFoundException('Trabalho academico nao encontrado.');
    }

    const parecerista = await this.prisma.perfilParecerista.findUnique({
      where: { id_usuario: idUsuario },
    });

    if (!parecerista) {
      throw new ForbiddenException(
        'Usuario autenticado nao possui perfil de parecerista.',
      );
    }

    if (
      dto.id_parecerista !== undefined &&
      dto.id_parecerista !== parecerista.id_parecerista
    ) {
      throw new ForbiddenException(
        'Nao e permitido registrar avaliacao em nome de outro parecerista.',
      );
    }

    const ehAutor = trabalho.submissoes?.some(
      (submissao) => submissao.autor?.id_usuario === parecerista.id_usuario,
    );

    if (ehAutor) {
      throw new ForbiddenException(
        'Conflito de interesses: o autor nao pode avaliar o proprio trabalho.',
      );
    }

    return this.prisma.$transaction(async (tx) =>
      spRegistrarAvaliacaoTrabalho(tx, {
        id_parecerista: parecerista.id_parecerista,
        id_trabalho: dto.id_trabalho,
        status: dto.status,
        parecer: dto.parecer,
        nota: new Prisma.Decimal(dto.nota),
      }),
    );
  }
}
