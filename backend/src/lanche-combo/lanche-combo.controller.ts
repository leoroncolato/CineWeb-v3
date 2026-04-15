import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { LancheComboService } from './lanche-combo.service';
import { CreateLancheComboDto } from './dto/create-lanche-combo.dto';
import { UpdateLancheComboDto } from './dto/update-lanche-combo.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lanches/Combos')
@Controller('lanche-combo')
export class LancheComboController {
  constructor(private readonly lancheComboService: LancheComboService) {}

  @Post()
  create(@Body() createLancheComboDto: CreateLancheComboDto) {
    return this.lancheComboService.create(createLancheComboDto);
  }

  @Get()
  findAll() {
    return this.lancheComboService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lancheComboService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLancheComboDto: UpdateLancheComboDto) {
    return this.lancheComboService.update(id, updateLancheComboDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lancheComboService.remove(id);
  }
}
