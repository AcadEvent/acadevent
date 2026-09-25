import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spReservarEspaco } from '../prisma/procedures';
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
      include: { edicao: true },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade nao encontrada.');
    }

    if (espaco.id_edicao !== atividade.id_edicao) {
      throw new BadRequestException(
        'O espaco fisico e a atividade devem pertencer a mesma edicao do evento.',
      );
    }

    const inicioReserva = new Date(dto.data_inicio);
    const fimReserva = new Date(dto.data_final);

    if (
      atividade.data_abertura_atividade &&
      inicioReserva < new Date(atividade.data_abertura_atividade)
    ) {
      throw new BadRequestException(
        'O horario da reserva nao pode iniciar antes do inicio da atividade.',
      );
    }

    if (
      atividade.data_encerramento_atividade &&
      fimReserva > new Date(atividade.data_encerramento_atividade)
    ) {
      throw new BadRequestException(
        'O horario da reserva nao pode encerrar apos o termino da atividade.',
      );
    }

    if (
      atividade.edicao?.data_abertura_evento &&
      inicioReserva < new Date(atividade.edicao.data_abertura_evento)
    ) {
      throw new BadRequestException(
        'O horario da reserva nao pode iniciar antes da abertura do evento.',
      );
    }

    if (
      atividade.edicao?.data_encerramento_evento &&
      fimReserva > new Date(atividade.edicao.data_encerramento_evento)
    ) {
      throw new BadRequestException(
        'O horario da reserva nao pode encerrar apos o encerramento do evento.',
      );
    }

    return this.prisma.$transaction(async (tx) =>
      spReservarEspaco(tx, {
        id_atividade: dto.id_atividade,
        id_espaco: dto.id_espaco,
        data_inicio: dto.data_inicio,
        data_final: dto.data_final,
      }),
    );
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
