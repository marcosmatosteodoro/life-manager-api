import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './enums/article-status.enum';
import {
  buildCorrectSummaryInput,
  CORRECT_SUMMARY_SYSTEM,
  CorrectSummaryResult,
} from './prompts/correct-summary.prompt';

// Teto de caracteres do resumo enviado à IA: protege custo e evita abuso.
const MAX_SUMMARY_LENGTH = 8000;

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
    private readonly aiService: AiService,
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

  /**
   * Corrige o resumo do artigo via IA: corrige a língua, gera (se preciso) uma
   * versão mais natural e atribui uma nota. Salva o resultado em
   * summaryCorrected + score; o status é recalculado (vira COMPLETED).
   */
  async correctSummary(id: number): Promise<Article> {
    const article = await this.findOne(id); // lança NotFound se não existir

    const summary = article.summary;
    if (!summary || summary.trim() === '') {
      throw new BadRequestException('Não há resumo para corrigir.');
    }
    if (summary.length > MAX_SUMMARY_LENGTH) {
      throw new BadRequestException(
        `Resumo muito longo (máximo de ${MAX_SUMMARY_LENGTH} caracteres).`,
      );
    }

    // Se a IA falhar, a exceção sobe e nada é salvo (fail secure).
    const raw = await this.aiService.complete({
      system: CORRECT_SUMMARY_SYSTEM,
      user: buildCorrectSummaryInput(summary),
      json: true,
    });

    const { correctedSummary, score } = this.parseCorrection(raw);
    article.summaryCorrected = correctedSummary;
    article.score = score;
    article.status = computeStatus(article);
    return this.articleRepository.save(article);
  }

  /** Valida e normaliza o JSON devolvido pela IA. */
  private parseCorrection(raw: string): CorrectSummaryResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new ServiceUnavailableException(
        'A resposta da IA veio em formato inválido. Tente novamente.',
      );
    }
    const obj = parsed as Partial<CorrectSummaryResult>;
    if (
      typeof obj.correctedSummary !== 'string' ||
      typeof obj.score !== 'number'
    ) {
      throw new ServiceUnavailableException(
        'A resposta da IA veio incompleta. Tente novamente.',
      );
    }
    // Garante inteiro entre 0 e 10, mesmo se o modelo extrapolar.
    const score = Math.max(0, Math.min(10, Math.round(obj.score)));
    return { correctedSummary: obj.correctedSummary, score };
  }
}
