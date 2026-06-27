import { ApiProperty } from '@nestjs/swagger';
import { Feedback } from '../entities/feedback.entity';

export class FeedbackListResponseDto {
  @ApiProperty({ example: 3, description: 'Quantidade de registros' })
  count: number;

  @ApiProperty({ type: Feedback, isArray: true, description: 'Feedbacks' })
  rows: Feedback[];
}
