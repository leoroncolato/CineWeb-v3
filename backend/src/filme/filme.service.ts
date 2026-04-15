import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilmeService {
  constructor(private prisma: PrismaService) {}

  async create(createFilmeDto: CreateFilmeDto) {
    // verifica a existencia do genero
    const genero = await this.prisma.genero.findUnique({
      where: { id: createFilmeDto.generoId }
    });
    if (!genero) throw new NotFoundException('Gênero não encontrado');

    const { dataInicialExibicao, dataFinalExibicao, ...rest } = createFilmeDto;

    return this.prisma.filme.create({
      data: {
        ...rest,
        dataInicialExibicao: new Date(dataInicialExibicao),
        dataFinalExibicao: new Date(dataFinalExibicao),
      },
      include: {
        genero: true
      }
    });
  }

  findAll() {
    return this.prisma.filme.findMany({
      include: { genero: true }
    });
  }

  async findOne(id: number) {
    const filme = await this.prisma.filme.findUnique({
      where: { id },
      include: { genero: true }
    });
    if (!filme) throw new NotFoundException('Filme não encontrado');
    return filme;
  }

  async update(id: number, updateFilmeDto: UpdateFilmeDto) {
    await this.findOne(id); // exists
    
    if (updateFilmeDto.generoId) {
       const genero = await this.prisma.genero.findUnique({
         where: { id: updateFilmeDto.generoId }
       });
       if (!genero) throw new NotFoundException('Gênero não encontrado');
    }

    const data: any = { ...updateFilmeDto };
    if (updateFilmeDto.dataInicialExibicao) data.dataInicialExibicao = new Date(updateFilmeDto.dataInicialExibicao);
    if (updateFilmeDto.dataFinalExibicao) data.dataFinalExibicao = new Date(updateFilmeDto.dataFinalExibicao);

    return this.prisma.filme.update({
      where: { id },
      data,
      include: { genero: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.filme.delete({
      where: { id }
    });
  }
}
