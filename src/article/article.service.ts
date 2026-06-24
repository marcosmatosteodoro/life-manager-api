import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './enums/article-status.enum';

/** Considera preenchido: número não-nulo ou string não-vazia. */
function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

/**
 * Calcula o status do artigo a partir dos campos preenchidos (waterfall).
 * O link é ignorado para fins de status.
 */
function computeStatus(article: Partial<Article>): ArticleStatus {
  if (!isFilled(article.timeRead)) return ArticleStatus.READING_IN_PROGRESS;
  if (!isFilled(article.timeWrite) || !isFilled(article.summary)) {
    return ArticleStatus.SUMMARY_IN_PROGRESS;
  }
  if (!isFilled(article.summaryCorrected)) {
    return ArticleStatus.APPLYING_CORRECTION;
  }
  return ArticleStatus.COMPLETED;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
    // Status é sempre derivado dos dados — nunca enviado pelo front.
    article.status = computeStatus(article);
    return this.articleRepository.save(article);
  }

  async findAll(): Promise<ArticleListResponseDto> {
    // findAndCount retorna [registros, total] numa única consulta.
    const [rows, count] = await this.articleRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article #${id} não encontrado`);
    }
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const article = await this.articleRepository.preload({
      id,
      ...updateArticleDto,
    });
    if (!article) {
      throw new NotFoundException(`Article #${id} não encontrado`);
    }
    // Recalcula o status sobre o registro já mesclado (existente + alterações).
    article.status = computeStatus(article);
    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Article #${id} não encontrado`);
    }
  }
}
