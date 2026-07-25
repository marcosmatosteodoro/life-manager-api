import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DiaryType } from '../enums/diary-type.enum';

export class CreateDiaryDto {
  // day date, obrigatório (YYYY-MM-DD).
  @ApiProperty({
    example: '2026-06-24',
    description: 'Dia do registro (YYYY-MM-DD)',
  })
  @IsDateString()
  day: string;

  // description texto longo, obrigatório e não-vazio.
  @ApiProperty({ example: 'Hoje foi um dia produtivo...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  // type enum, obrigatório.
  @ApiProperty({ enum: DiaryType, example: DiaryType.DAILY })
  @IsEnum(DiaryType)
  type: DiaryType;
}
