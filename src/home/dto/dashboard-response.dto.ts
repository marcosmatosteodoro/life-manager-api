import { ApiProperty } from '@nestjs/swagger';
import { ArticleStatus } from '../../article/enums/article-status.enum';

class DashboardWeightDto {
  @ApiProperty({ example: 82.5, nullable: true })
  latest: number | null;

  @ApiProperty({
    example: true,
    description: 'Há registro de peso nesta semana',
  })
  loggedThisWeek: boolean;
}

class DashboardTodosDto {
  @ApiProperty({ example: 2 })
  done: number;

  @ApiProperty({ example: 5 })
  total: number;
}

class DashboardStudyDto {
  @ApiProperty({
    enum: ArticleStatus,
    nullable: true,
    description: 'Status do estudo criado hoje, ou null se não houver',
  })
  todayStatus: ArticleStatus | null;
}

class DashboardFlashcardsDto {
  @ApiProperty({ example: 120 })
  totalCards: number;

  @ApiProperty({ example: 8 })
  groupCount: number;
}

/** Tudo que a Home precisa, agregado numa única resposta. */
export class DashboardResponseDto {
  @ApiProperty({ example: 3, description: 'Dias seguidos com estudo' })
  streak: number;

  @ApiProperty({ type: DashboardWeightDto })
  weight: DashboardWeightDto;

  @ApiProperty({ type: DashboardTodosDto })
  todos: DashboardTodosDto;

  @ApiProperty({ type: DashboardStudyDto })
  study: DashboardStudyDto;

  @ApiProperty({ type: DashboardFlashcardsDto })
  flashcards: DashboardFlashcardsDto;

  @ApiProperty({ example: 12 })
  appliesCount: number;

  @ApiProperty({ example: 2, description: 'Candidaturas feitas hoje' })
  appliesToday: number;
}
