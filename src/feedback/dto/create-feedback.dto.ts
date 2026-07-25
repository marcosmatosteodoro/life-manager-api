import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FeedbackPeriod } from '../enums/feedback-period.enum';

export class CreateFeedbackDto {
  // Período a analisar (obrigatório).
  @ApiProperty({ enum: FeedbackPeriod, example: FeedbackPeriod.THIRTY_DAYS })
  @IsEnum(FeedbackPeriod)
  period: FeedbackPeriod;
}
