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
      include: { sala: true, ingressos: true }
    });

    if (!sessao) throw new NotFoundException('Sessão não encontrada');

    // Regra de Negócio 2: Controle de Capacidade
    if (sessao.ingressos.length >= sessao.sala.capacidade) {
      throw new ConflictException('A capacidade da sala para esta sessão já foi atingida.');
    }

    return this.prisma.ingresso.create({
      data: createIngressoDto,
      include: { sessao: true, pedido: true }
    });
  }

  findAll() {
    return this.prisma.ingresso.findMany({
      include: { sessao: true, pedido: true }
    });
  }

  async findOne(id: number) {
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id },
      include: { sessao: true, pedido: true }
    });
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado');
    return ingresso;
  }

  update(id: number, updateIngressoDto: UpdateIngressoDto) {
    // Requisitos falam: "Criar e Visualizar (por ID e lista completa) ingressos."
    // Update não é estritamente proibido, mas podemos adicionar
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
