import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateBacklogItemDto {
  @ApiProperty({ example: 'Exportar relatório em PDF' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ example: 'Detalhes da ideia...' })
  @IsOptional()
  @IsString()
  description?: string;
}
