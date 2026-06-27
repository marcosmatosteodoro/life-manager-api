import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { FeedbackPeriod } from '../enums/feedback-period.enum';

export class CreateFeedbackDto {
  // Período a analisar (obrigatório).
  @ApiProperty({ enum: FeedbackPeriod, example: FeedbackPeriod.THIRTY_DAYS })
  @IsEnum(FeedbackPeriod)
  period: FeedbackPeriod;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
