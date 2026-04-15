import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFilmeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sinopse?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classificacaoEtaria: string;

  @ApiProperty({ description: 'Duração em minutos' })
  @IsInt()
  @Min(1)
  duracao: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  elenco?: string;

  @ApiProperty()
  @IsInt()
  generoId: number;

  @ApiProperty({ example: '2023-11-01' })
  @IsDateString()
  @IsNotEmpty()
  dataInicialExibicao: string;

  @ApiProperty({ example: '2023-12-01' })
  @IsDateString()
  @IsNotEmpty()
  dataFinalExibicao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cinemaId?: number;
}
