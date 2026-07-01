import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

/** Edita apenas os dados do item; status/position mudam por endpoints próprios. */
export class UpdateBacklogItemDto {
  @ApiPropertyOptional({ example: 'Novo título' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ example: 'Descrição atualizada', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
