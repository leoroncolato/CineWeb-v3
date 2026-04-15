import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessaoService {
  constructor(private prisma: PrismaService) {}

  async validarChoqueHorario(salaId: number, dataStr: string, filmeId: number, sessaoIgnoradaId?: number) {
    const dataNovaSessao = new Date(dataStr).getTime();
    
    const novoFilme = await this.prisma.filme.findUnique({ where: { id: filmeId } });
    if (!novoFilme) throw new NotFoundException('Filme não encontrado');
    
    const fimNovaSessao = dataNovaSessao + (novoFilme.duracao * 60 * 1000);

    const sessoesExistentes = await this.prisma.sessao.findMany({
      where: { salaId },
      include: { filme: true }
    });

    for (const sessao of sessoesExistentes) {
      if (sessaoIgnoradaId && sessao.id === sessaoIgnoradaId) continue;

      const inicioExistente = sessao.data.getTime();
      const fimExistente = inicioExistente + (sessao.filme.duracao * 60 * 1000);

      // Regra de sobreposição: (Inicio A < Fim B) && (Fim A > Inicio B)
      if (dataNovaSessao < fimExistente && fimNovaSessao > inicioExistente) {
        throw new ConflictException('Já existe uma sessão nesta sala neste horário (choque de horários).');
      }
    }
  }

  async create(createSessaoDto: CreateSessaoDto) {
    await this.validarChoqueHorario(createSessaoDto.salaId, createSessaoDto.data, createSessaoDto.filmeId);
    
    const { data, ...rest } = createSessaoDto;
    return this.prisma.sessao.create({
      data: {
        ...rest,
        data: new Date(data)
      },
      include: { filme: true, sala: true }
    });
  }

  findAll() {
    return this.prisma.sessao.findMany({ include: { filme: true, sala: true } });
  }

  async findOne(id: number) {
    const sessao = await this.prisma.sessao.findUnique({ where: { id }, include: { filme: true, sala: true } });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    return sessao;
  }

  async update(id: number, updateSessaoDto: UpdateSessaoDto) {
    const sessao = await this.findOne(id);
    
    const salaId = updateSessaoDto.salaId || sessao.salaId;
    const filmeId = updateSessaoDto.filmeId || sessao.filmeId;
    const data = updateSessaoDto.data || sessao.data.toISOString();

    if (updateSessaoDto.data || updateSessaoDto.salaId || updateSessaoDto.filmeId) {
       await this.validarChoqueHorario(salaId, data, filmeId, id);
    }

    const payload: any = { ...updateSessaoDto };
    if (updateSessaoDto.data) payload.data = new Date(updateSessaoDto.data);

    return this.prisma.sessao.update({
      where: { id },
      data: payload,
      include: { filme: true, sala: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sessao.delete({ where: { id } });
  }
}
