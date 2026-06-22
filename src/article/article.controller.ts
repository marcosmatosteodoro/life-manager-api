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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
