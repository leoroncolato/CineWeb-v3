import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeneroDto {
  @ApiProperty({ example: 'Ação' })
  @IsString()
  @IsNotEmpty()
  nome: string;
}
