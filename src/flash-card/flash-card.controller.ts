import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { FlashCardListResponseDto } from './dto/flash-card-list-response.dto';
import {
  ReviewFlashCardDto,
  ReviewFlashCardItemDto,
} from './dto/review-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardService } from './flash-card.service';

@ApiTags('flash-card')
@Controller('flash-card')
export class FlashCardController {
  constructor(private readonly service: FlashCardService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um flashcard' })
  @ApiOkResponse({ type: FlashCard })
  @ApiNotFoundResponse({
    description: 'Grupo (flashCardGroupId) não encontrado',
  })
  create(@Body() dto: CreateFlashCardDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os flashcards' })
  @ApiOkResponse({ type: FlashCardListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // Estática — precisa vir antes de ':id' para não colidir com o ParseIntPipe.
  @Patch('reviews')
  @ApiOperation({ summary: 'Review em lote de flashcards' })
  @ApiBody({ type: [ReviewFlashCardItemDto] })
  @ApiOkResponse({ type: FlashCard, isArray: true })
  reviewBatch(
    @Body(new ParseArrayPipe({ items: ReviewFlashCardItemDto }))
    items: ReviewFlashCardItemDto[],
  ) {
    return this.service.reviewBatch(items);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review de um flashcard (acerto/erro)' })
  @ApiOkResponse({ type: FlashCard })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewFlashCardDto,
  ) {
    return this.service.review(id, dto.correctAnswers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um flashcard por id' })
  @ApiOkResponse({ type: FlashCard })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Atualiza um flashcard (não altera correctAnswers, wrongAnswers nem score)',
  })
  @ApiOkResponse({ type: FlashCard })
  @ApiNotFoundResponse({ description: 'Registro (ou grupo) não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashCardDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um flashcard' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
