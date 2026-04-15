import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sessões')
@Controller('sessao')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) {}

  @Post()
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessaoService.create(createSessaoDto);
  }

  @Get()
  findAll() {
    return this.sessaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessaoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSessaoDto: UpdateSessaoDto) {
    return this.sessaoService.update(id, updateSessaoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessaoService.remove(id);
  }
}
