import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ArticleService } from './article.service';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um artigo' })
  @ApiOkResponse({ type: Article })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  // Endpoint pago (IA): rate limit estrito por usuário — 5/min basta para uso
  // humano e barra loops/abuso que gerariam custo na OpenAI.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post(':id/correct-summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Corrige o resumo do artigo via IA e atribui uma pontuação',
  })
  @ApiOkResponse({ type: Article })
  @ApiBadRequestResponse({ description: 'Sem resumo ou resumo muito longo' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  @ApiServiceUnavailableResponse({ description: 'Falha no serviço de IA' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  correctSummary(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.correctSummary(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os artigos' })
  @ApiOkResponse({ type: ArticleListResponseDto })
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um artigo por id' })
  @ApiOkResponse({ type: Article })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um artigo' })
  @ApiOkResponse({ type: Article })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um artigo' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.remove(id);
  }
}
