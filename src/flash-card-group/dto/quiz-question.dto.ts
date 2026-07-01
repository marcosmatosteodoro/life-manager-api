import { ApiProperty } from '@nestjs/swagger';

/** Uma pergunta do modo avaliação: termo + opções (1 correta + distratores). */
export class QuizQuestionDto {
  @ApiProperty({
    example: 1,
    description: 'Id do flashcard (para salvar o review)',
  })
  id: number;

  @ApiProperty({ example: 'give up' })
  term: string;

  @ApiProperty({ example: 'desistir', description: 'Value correto' })
  value: string;

  @ApiProperty({
    example: ['desistir', 'aumentar', 'adiar', 'reunir'],
    description: 'Opções embaralhadas (inclui o value correto)',
    type: [String],
  })
  options: string[];
}
