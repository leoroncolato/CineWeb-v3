import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { IngressoService } from './ingresso.service';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Ingressos')
@Controller('ingresso')
export class IngressoController {
  constructor(private readonly ingressoService: IngressoService) {}

  @Post()
  create(@Body() createIngressoDto: CreateIngressoDto) {
    return this.ingressoService.create(createIngressoDto);
  }

  @Get()
  findAll() {
    return this.ingressoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingressoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIngressoDto: UpdateIngressoDto) {
    return this.ingressoService.update(id, updateIngressoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingressoService.remove(id);
  }
}
