import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CheckoutPedidoDto } from './dto/checkout-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidoService {
  constructor(private prisma: PrismaService) {}

  async calcularTotal(ingressoIds: number[] = [], lancheIds: number[] = []) {
    let valorTotal = 0;
    let qtInteira = 0;
    let qtMeia = 0;
    const lancheQuantidades = lancheIds.reduce<Record<number, number>>((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const ingressos = await this.prisma.ingresso.findMany({
      where: { id: { in: ingressoIds } },
    });
    const lanches = await this.prisma.lancheCombo.findMany({
      where: { id: { in: lancheIds } },
    });

    for (const ingresso of ingressos) {
      valorTotal += ingresso.valorPago;
      if (ingresso.tipo.toLowerCase().includes('inteira')) qtInteira++;
      if (ingresso.tipo.toLowerCase().includes('meia')) qtMeia++;
    }

    for (const lanche of lanches) {
      valorTotal += lanche.preco * (lancheQuantidades[lanche.id] || 1);
    }

    return { valorTotal, qtInteira, qtMeia };
  }

  async create(createPedidoDto: CreatePedidoDto) {
    const ingressoIds = createPedidoDto.ingressoIds || [];
    const lancheIds = createPedidoDto.lancheIds || [];

    const { valorTotal, qtInteira, qtMeia } = await this.calcularTotal(ingressoIds, lancheIds);
    const combos = await this.buildCombosFromIds(lancheIds);

    const pedido = await this.prisma.pedido.create({
      data: {
        valorTotal,
        qtInteira,
        qtMeia,
        formaPagamento: 'PDV',
        combos: combos as any,
      },
    });

    if (ingressoIds.length > 0) {
      await this.prisma.ingresso.updateMany({
        where: { id: { in: ingressoIds } },
        data: { pedidoId: pedido.id },
      });
    }

    return this.findOne(pedido.id);
  }

  async checkout(dto: CheckoutPedidoDto, usuarioId: number) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: dto.sessaoId },
      include: {
        filme: true,
        sala: true,
        ingressos: true,
      },
    });

    if (!sessao) throw new NotFoundException('Sessao nao encontrada');

    const assentosSolicitados = dto.ingressos.map((ingresso) => ingresso.assento.toUpperCase());
    const assentosUnicos = new Set(assentosSolicitados);
    if (assentosUnicos.size !== assentosSolicitados.length) {
      throw new ConflictException('Ha assentos repetidos na compra');
    }

    for (const assento of assentosSolicitados) {
      if (!this.assentoExiste(sessao.sala.poltronas, assento)) {
        throw new ConflictException(`Assento ${assento} nao existe na sala`);
      }
    }

    const ocupados = sessao.ingressos
      .map((ingresso) => ingresso.assento?.toUpperCase())
      .filter(Boolean);
    const indisponivel = assentosSolicitados.find((assento) => ocupados.includes(assento));
    if (indisponivel) {
      throw new ConflictException(`Assento ${indisponivel} ja vendido para esta sessao`);
    }

    if (sessao.ingressos.length + dto.ingressos.length > sessao.sala.capacidade) {
      throw new ConflictException('A capacidade da sala para esta sessao ja foi atingida');
    }

    const comboIds = dto.combos?.map((combo) => combo.lancheComboId) || [];
    const combosCatalogo = comboIds.length
      ? await this.prisma.lancheCombo.findMany({ where: { id: { in: comboIds } } })
      : [];

    if (new Set(comboIds).size !== combosCatalogo.length) {
      throw new NotFoundException('Um ou mais combos nao foram encontrados');
    }

    const combos = (dto.combos || []).map((combo) => {
      const item = combosCatalogo.find((catalogo) => catalogo.id === combo.lancheComboId);
      if (!item) throw new NotFoundException('Combo nao encontrado');
      const subtotal = item.preco * combo.quantidade;
      return {
        lancheComboId: item.id,
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        quantidade: combo.quantidade,
        subtotal,
      };
    });

    const ingressos = dto.ingressos.map((ingresso) => {
      const valorPago = ingresso.tipo === 'Meia' ? sessao.valorIngresso / 2 : sessao.valorIngresso;
      return {
        tipo: ingresso.tipo,
        assento: ingresso.assento.toUpperCase(),
        valorPago,
        sessaoId: sessao.id,
      };
    });

    const qtInteira = ingressos.filter((ingresso) => ingresso.tipo === 'Inteira').length;
    const qtMeia = ingressos.filter((ingresso) => ingresso.tipo === 'Meia').length;
    const valorIngressos = ingressos.reduce((total, ingresso) => total + ingresso.valorPago, 0);
    const valorCombos = combos.reduce((total, combo) => total + combo.subtotal, 0);
    const valorTotal = Number((valorIngressos + valorCombos).toFixed(2));

    const pedido = await this.prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          qtInteira,
          qtMeia,
          valorTotal,
          formaPagamento: dto.formaPagamento,
          statusPagamento: 'APROVADO',
          combos: combos as any,
          usuarioId,
        },
      });

      await tx.ingresso.createMany({
        data: ingressos.map((ingresso) => ({
          ...ingresso,
          pedidoId: novoPedido.id,
        })),
      });

      return novoPedido;
    });

    return this.findOne(pedido.id);
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: this.pedidoInclude(),
      orderBy: { dataHora: 'desc' },
    });
  }

  async findByUser(usuarioId: number) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      include: this.pedidoInclude(),
      orderBy: { dataHora: 'desc' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: this.pedidoInclude(),
    });
    if (!pedido) throw new NotFoundException('Pedido nao encontrado');
    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedidoAtual = await this.findOne(id);

    const ingressoIds = updatePedidoDto.ingressoIds || pedidoAtual.ingressos.map((i) => i.id);
    const lancheIds = updatePedidoDto.lancheIds || pedidoAtual.lanches.map((l) => l.id);

    const { valorTotal, qtInteira, qtMeia } = await this.calcularTotal(ingressoIds, lancheIds);

    if (updatePedidoDto.ingressoIds) {
      await this.prisma.ingresso.updateMany({
        where: { pedidoId: id },
        data: { pedidoId: null },
      });
      await this.prisma.ingresso.updateMany({
        where: { id: { in: updatePedidoDto.ingressoIds } },
        data: { pedidoId: id },
      });
    }

    if (updatePedidoDto.lancheIds) {
      await this.prisma.lancheCombo.updateMany({
        where: { pedidoId: id },
        data: { pedidoId: null },
      });
      await this.prisma.lancheCombo.updateMany({
        where: { id: { in: updatePedidoDto.lancheIds } },
        data: { pedidoId: id },
      });
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { valorTotal, qtInteira, qtMeia },
      include: this.pedidoInclude(),
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pedido.delete({
      where: { id },
    });
  }

  private pedidoInclude() {
    return {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
      ingressos: {
        include: {
          sessao: {
            include: {
              filme: true,
              sala: true,
            },
          },
        },
      },
      lanches: true,
    };
  }

  private assentoExiste(poltronas: any, assento: string) {
    if (!Array.isArray(poltronas)) return true;

    const match = /^([A-Z])(\d+)$/.exec(assento);
    if (!match) return false;

    const row = match[1].charCodeAt(0) - 65;
    const col = Number(match[2]) - 1;
    const value = poltronas[row]?.[col];

    return value === 1 || value === true || value === '1' || value === 'livre';
  }

  private async buildCombosFromIds(lancheIds: number[]) {
    if (!lancheIds.length) return [];

    const quantidades = lancheIds.reduce<Record<number, number>>((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const lanches = await this.prisma.lancheCombo.findMany({
      where: { id: { in: Object.keys(quantidades).map(Number) } },
    });

    return lanches.map((lanche) => ({
      lancheComboId: lanche.id,
      nome: lanche.nome,
      descricao: lanche.descricao,
      preco: lanche.preco,
      quantidade: quantidades[lanche.id],
      subtotal: lanche.preco * quantidades[lanche.id],
    }));
  }
}
