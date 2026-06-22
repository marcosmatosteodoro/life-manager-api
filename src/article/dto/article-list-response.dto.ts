import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../entities/article.entity';

export class ArticleListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({ type: Article, isArray: true, description: 'Artigos' })
  rows: Article[];
}
