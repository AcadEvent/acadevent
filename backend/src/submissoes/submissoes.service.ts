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

  async registrarAvaliacao(dto: RegistrarAvaliacaoDto) {
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
      where: { id_parecerista: dto.id_parecerista },
    });

    if (!parecerista) {
      throw new NotFoundException('Perfil de parecerista nao encontrado.');
    }

    const ehAutor = trabalho.submissoes?.some((submissao) => {
      if (submissao.autor && parecerista.id_usuario) {
        return submissao.autor.id_usuario === parecerista.id_usuario;
      }
      return submissao.id_autor === dto.id_parecerista;
    });

    if (ehAutor) {
      throw new ForbiddenException(
        'Conflito de interesses: o autor nao pode avaliar o proprio trabalho.',
      );
    }

    return this.prisma.$transaction(async (tx) =>
      spRegistrarAvaliacaoTrabalho(tx, {
        id_parecerista: dto.id_parecerista,
        id_trabalho: dto.id_trabalho,
        status: dto.status,
        parecer: dto.parecer,
        nota: new Prisma.Decimal(dto.nota),
      }),
    );
  }
}
