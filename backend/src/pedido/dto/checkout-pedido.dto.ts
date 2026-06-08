import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CheckoutIngressoDto {
  @ApiProperty({ enum: ['Inteira', 'Meia'] })
  @IsIn(['Inteira', 'Meia'])
  tipo: 'Inteira' | 'Meia';

  @ApiProperty({ example: 'A1' })
  @IsString()
  @IsNotEmpty()
  assento: string;
}

class CheckoutComboDto {
  @ApiProperty()
  @IsInt()
  lancheComboId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CheckoutPedidoDto {
  @ApiProperty()
  @IsInt()
  sessaoId: number;

  @ApiProperty({ type: [CheckoutIngressoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutIngressoDto)
  ingressos: CheckoutIngressoDto[];

  @ApiPropertyOptional({ type: [CheckoutComboDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutComboDto)
  combos?: CheckoutComboDto[];

  @ApiProperty({ example: 'Cartao de credito' })
  @IsString()
  @IsNotEmpty()
  formaPagamento: string;
}
