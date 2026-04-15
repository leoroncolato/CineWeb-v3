import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessaoDto {
  @ApiProperty({ example: '2023-11-20T20:00:00Z', description: 'Data e horário de início da sessão' })
  @IsDateString()
  @IsNotEmpty()
  data: string;

  @ApiProperty({ description: 'Valor base do ingresso' })
  @IsNumber()
  @Min(0)
  valorIngresso: number;

  @ApiProperty()
  @IsInt()
  filmeId: number;

  @ApiProperty()
  @IsInt()
  salaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cinemaId?: number;
}
