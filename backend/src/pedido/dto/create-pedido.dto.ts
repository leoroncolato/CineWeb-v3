import { IsArray, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePedidoDto {
  @ApiPropertyOptional({ type: [Number], description: 'Array de IDs de ingressos' })
  @IsArray()
  @IsOptional()
  ingressoIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Array de IDs de lanches/combos' })
  @IsArray()
  @IsOptional()
  lancheIds?: number[];
}
