import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FilmeService } from './filme.service';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Filmes')
@Controller('filme')
export class FilmeController {
  constructor(private readonly filmeService: FilmeService) {}

  @Post()
  create(@Body() createFilmeDto: CreateFilmeDto) {
    return this.filmeService.create(createFilmeDto);
  }

  @Get()
  findAll() {
    return this.filmeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filmeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFilmeDto: UpdateFilmeDto) {
    return this.filmeService.update(id, updateFilmeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filmeService.remove(id);
  }
}
