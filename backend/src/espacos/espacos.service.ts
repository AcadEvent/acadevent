import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEspacoDto } from './dto/criar-espaco.dto';
import { ReservarEspacoDto } from './dto/reservar-espaco.dto';

@Injectable()
export class EspacosService {
  constructor(private readonly prisma: PrismaService) {}

  async criarEspaco(dto: CriarEspacoDto) {
    const edicao = await this.prisma.edicao.findUnique({
      where: { id_edicao: dto.id_edicao },
    });

    if (!edicao) {
      throw new NotFoundException('Edicao do evento nao encontrada.');
    }

    return this.prisma.espacoFisico.create({
      data: {
        id_edicao: dto.id_edicao,
        tipo_espaco: dto.tipo_espaco,
        descricao_local: dto.descricao_local,
        instituicao: dto.instituicao,
        nome_sala: dto.nome_sala,
        capacidade_max: dto.capacidade_max,
        descricao_recursos_disponiveis: dto.descricao_recursos_disponiveis,
      },
    });
  }

  async listarEspacosPorEdicao(idEdicao: number) {
    return this.prisma.espacoFisico.findMany({
      where: { id_edicao: idEdicao },
      orderBy: { id_espaco: 'asc' },
    });
  }

  async reservarEspaco(dto: ReservarEspacoDto) {
    if (dto.data_inicio >= dto.data_final) {
      throw new BadRequestException(
        'A data de inicio da reserva deve ser anterior a data final.',
      );
    }

    const espaco = await this.prisma.espacoFisico.findUnique({
      where: { id_espaco: dto.id_espaco },
    });

    if (!espaco) {
      throw new NotFoundException('Espaco fisico nao encontrado.');
    }

    const atividade = await this.prisma.atividade.findUnique({
      where: { id_atividade: dto.id_atividade },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade nao encontrada.');
    }

    const reservasExistentes = await this.prisma.reserva.findMany({
      where: { id_espaco: dto.id_espaco },
    });

    for (const r of reservasExistentes) {
      if (r.data_inicio && r.data_final) {
        if (dto.data_inicio < r.data_final && dto.data_final > r.data_inicio) {
          throw new ConflictException(
            'Conflito de agendamento detectado: o espaco fisico ja possui uma reserva no intervalo informado.',
          );
        }
      }
    }

    return this.prisma.reserva.create({
      data: {
        id_atividade: dto.id_atividade,
        id_espaco: dto.id_espaco,
        data_inicio: dto.data_inicio,
        data_final: dto.data_final,
      },
    });
  }

  async obterMapaOcupacao(idEdicao: number) {
    const espacos = await this.prisma.espacoFisico.findMany({
      where: { id_edicao: idEdicao },
      include: {
        reservas: {
          include: {
            atividade: true,
          },
          orderBy: { data_inicio: 'asc' },
        },
      },
    });

    return espacos;
  }
}
