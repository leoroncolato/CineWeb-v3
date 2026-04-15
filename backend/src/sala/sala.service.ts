import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaService {
  constructor(private prisma: PrismaService) {}

  async create(createSalaDto: CreateSalaDto) {
    const existing = await this.prisma.sala.findUnique({
      where: { numero: createSalaDto.numero },
    });
    if (existing) throw new ConflictException('Sala com este número já existe');

    return this.prisma.sala.create({
      data: createSalaDto,
    });
  }

  findAll() {
    return this.prisma.sala.findMany();
  }

  async findOne(id: number) {
    const sala = await this.prisma.sala.findUnique({ where: { id } });
    if (!sala) throw new NotFoundException('Sala não encontrada');
    return sala;
  }

  async update(id: number, updateSalaDto: UpdateSalaDto) {
    await this.findOne(id); // exists
    if (updateSalaDto.numero) {
      const existing = await this.prisma.sala.findUnique({
        where: { numero: updateSalaDto.numero },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Outra sala com este número já existe');
      }
    }

    return this.prisma.sala.update({
      where: { id },
      data: updateSalaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sala.delete({ where: { id } });
  }
}
