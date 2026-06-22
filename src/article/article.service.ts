import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
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
    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Article #${id} não encontrado`);
    }
  }
}
