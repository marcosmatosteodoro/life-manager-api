import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProblemCategoryDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  // Cor da tag; hex validado (o valor é aplicado como CSS no front).
  @ApiProperty({ example: '#ef4444' })
  @IsHexColor()
  color: string;
}
