import { IsArray, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaDto {
  @ApiProperty({ description: 'Número único da sala' })
  @IsInt()
  @IsNotEmpty()
  numero: number;

  @ApiProperty({ description: 'Capacidade máxima de assentos' })
  @IsInt()
  @Min(1)
  capacidade: number;

  @ApiProperty({ description: 'Layout das poltronas em array bidimensional' })
  @IsArray()
  poltronas: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cinemaId?: number;
}
