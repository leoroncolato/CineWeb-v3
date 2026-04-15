import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidoService {
  constructor(private prisma: PrismaService) { }

  async calcularTotal(ingressoIds: number[] = [], lancheIds: number[] = []) {
    let valorTotal = 0;
    let qtInteira = 0;
    let qtMeia = 0;

    const ingressos = await this.prisma.ingresso.findMany({
      where: { id: { in: ingressoIds } }
    });
    const lanches = await this.prisma.lancheCombo.findMany({
      where: { id: { in: lancheIds } }
    });

    for (const ingresso of ingressos) {
      valorTotal += ingresso.valorPago;
      if (ingresso.tipo.toLowerCase().includes('inteira')) qtInteira++;
      if (ingresso.tipo.toLowerCase().includes('meia')) qtMeia++;
    }

    for (const lanche of lanches) {
      // Usa subtotal (preço * qtUnidade)
      valorTotal += (lanche.subtotal || 0);
    }

    return { valorTotal, qtInteira, qtMeia };
  }

  async create(createPedidoDto: CreatePedidoDto) {
    const ingressoIds = createPedidoDto.ingressoIds || [];
    const lancheIds = createPedidoDto.lancheIds || [];

    // RN3: Cálculo do total
    const { valorTotal, qtInteira, qtMeia } = await this.calcularTotal(ingressoIds, lancheIds);

    const pedido = await this.prisma.pedido.create({
      data: {
        valorTotal,
        qtInteira,
        qtMeia
      }
    });

    if (ingressoIds.length > 0) {
      await this.prisma.ingresso.updateMany({
        where: { id: { in: ingressoIds } },
        data: { pedidoId: pedido.id }
      });
    }

    if (lancheIds.length > 0) {
      await this.prisma.lancheCombo.updateMany({
        where: { id: { in: lancheIds } },
        data: { pedidoId: pedido.id }
      });
    }

    return this.findOne(pedido.id);
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: { ingressos: true, lanches: true }
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { ingressos: true, lanches: true }
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    // Para simplificar, assumimos que se atualizar, recalcula
    const pedidoAtual = await this.findOne(id);

    // Obter IDs dos itens (recebidos no update ou os que já estavam associados)
    const ingressoIds = updatePedidoDto.ingressoIds || pedidoAtual.ingressos.map(i => i.id);
    const lancheIds = updatePedidoDto.lancheIds || pedidoAtual.lanches.map(l => l.id);

    const { valorTotal, qtInteira, qtMeia } = await this.calcularTotal(ingressoIds, lancheIds);

    // Se houve mudança nas associações
    if (updatePedidoDto.ingressoIds) {
      // Desassocia antigos
      await this.prisma.ingresso.updateMany({
        where: { pedidoId: id },
        data: { pedidoId: null }
      });
      // Associa novos
      await this.prisma.ingresso.updateMany({
        where: { id: { in: updatePedidoDto.ingressoIds } },
        data: { pedidoId: id }
      });
    }

    if (updatePedidoDto.lancheIds) {
      await this.prisma.lancheCombo.updateMany({
        where: { pedidoId: id },
        data: { pedidoId: null }
      });
      await this.prisma.lancheCombo.updateMany({
        where: { id: { in: updatePedidoDto.lancheIds } },
        data: { pedidoId: id }
      });
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { valorTotal, qtInteira, qtMeia },
      include: { ingressos: true, lanches: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pedido.delete({
      where: { id }
    });
  }
}
