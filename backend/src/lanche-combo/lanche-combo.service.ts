import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLancheComboDto } from './dto/create-lanche-combo.dto';
import { UpdateLancheComboDto } from './dto/update-lanche-combo.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LancheComboService {
  constructor(private prisma: PrismaService) {}

  create(createLancheComboDto: CreateLancheComboDto) {
    const subtotal = createLancheComboDto.preco * createLancheComboDto.qtUnidade;
    return this.prisma.lancheCombo.create({
      data: {
        ...createLancheComboDto,
        subtotal
      }
    });
  }

  findAll() {
    return this.prisma.lancheCombo.findMany({ include: { pedido: true } });
  }

  async findOne(id: number) {
    const lanche = await this.prisma.lancheCombo.findUnique({
      where: { id },
      include: { pedido: true }
    });
    if (!lanche) throw new NotFoundException('Lanche/Combo não encontrado');
    return lanche;
  }

  async update(id: number, updateLancheComboDto: UpdateLancheComboDto) {
    const lanche = await this.findOne(id);
    const preco = updateLancheComboDto.preco ?? lanche.preco;
    const qtUnidade = updateLancheComboDto.qtUnidade ?? lanche.qtUnidade;
    const subtotal = preco * qtUnidade;

    return this.prisma.lancheCombo.update({
      where: { id },
      data: {
        ...updateLancheComboDto,
        subtotal
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.lancheCombo.delete({
      where: { id }
    });
  }
}
