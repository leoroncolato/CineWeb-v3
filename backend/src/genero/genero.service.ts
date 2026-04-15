import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeneroService {
  constructor(private prisma: PrismaService) {}

  async create(createGeneroDto: CreateGeneroDto) {
    const existing = await this.prisma.genero.findUnique({
      where: { nome: createGeneroDto.nome }
    });
    
    if (existing) {
      throw new ConflictException('Gênero já existe com este nome');
    }

    return this.prisma.genero.create({
      data: createGeneroDto,
    });
  }

  findAll() {
    return this.prisma.genero.findMany();
  }

  async findOne(id: number) {
    const genero = await this.prisma.genero.findUnique({
      where: { id },
    });
    if (!genero) throw new NotFoundException('Gênero não encontrado');
    return genero;
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto) {
    await this.findOne(id); // verifica se existe
    
    if (updateGeneroDto.nome) {
      const existing = await this.prisma.genero.findUnique({
        where: { nome: updateGeneroDto.nome }
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Outro gênero já existe com este nome');
      }
    }

    return this.prisma.genero.update({
      where: { id },
      data: updateGeneroDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.genero.delete({
      where: { id },
    });
  }
}
