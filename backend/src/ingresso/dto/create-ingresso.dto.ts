import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngressoDto {
  @ApiProperty({ description: 'Tipo do ingresso, ex: Inteira, Meia' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ description: 'Valor pago pelo ingresso' })
  @IsNumber()
  @Min(0)
  valorPago: number;

  @ApiProperty()
  @IsInt()
  sessaoId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pedidoId?: number;
}
