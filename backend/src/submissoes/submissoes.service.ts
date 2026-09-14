import { Injectable, NotFoundException } from '@nestjs/common';
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
