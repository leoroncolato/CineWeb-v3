import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngressoService {
  constructor(private prisma: PrismaService) {}

  async create(createIngressoDto: CreateIngressoDto) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: createIngressoDto.sessaoId },
      include: { sala: true, ingressos: true },
    });

    if (!sessao) throw new NotFoundException('Sessao nao encontrada');

    if (createIngressoDto.assento) {
      const assentoOcupado = sessao.ingressos.some(
        (ingresso) => ingresso.assento === createIngressoDto.assento,
      );

      if (assentoOcupado) {
        throw new ConflictException('Assento ja vendido para esta sessao.');
      }
    }

    if (sessao.ingressos.length >= sessao.sala.capacidade) {
      throw new ConflictException('A capacidade da sala para esta sessao ja foi atingida.');
    }

    return this.prisma.ingresso.create({
      data: createIngressoDto,
      include: { sessao: { include: { filme: true, sala: true } }, pedido: true },
    });
  }

  findAll() {
    return this.prisma.ingresso.findMany({
      include: { sessao: { include: { filme: true, sala: true } }, pedido: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id },
      include: { sessao: { include: { filme: true, sala: true } }, pedido: true },
    });
    if (!ingresso) throw new NotFoundException('Ingresso nao encontrado');
    return ingresso;
  }

  async findOccupiedSeats(sessaoId: number) {
    const sessao = await this.prisma.sessao.findUnique({ where: { id: sessaoId } });
    if (!sessao) throw new NotFoundException('Sessao nao encontrada');

    const ingressos = await this.prisma.ingresso.findMany({
      where: { sessaoId, assento: { not: null } },
      select: { assento: true },
    });

    return ingressos.map((ingresso) => ingresso.assento).filter(Boolean);
  }

  update(id: number, updateIngressoDto: UpdateIngressoDto) {
    return this.prisma.ingresso.update({
      where: { id },
      data: updateIngressoDto,
    });
  }

  remove(id: number) {
    return this.prisma.ingresso.delete({
      where: { id },
    });
  }
}
