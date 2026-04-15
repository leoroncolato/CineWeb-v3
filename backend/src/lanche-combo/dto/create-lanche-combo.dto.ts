import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLancheComboDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  qtUnidade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pedidoId?: number;
}
