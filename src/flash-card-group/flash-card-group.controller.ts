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
  ApiTags,
} from '@nestjs/swagger';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { AbsorbFlashCardGroupDto } from './dto/absorb-flash-card-group.dto';
import { CreateFlashCardGroupDto } from './dto/create-flash-card-group.dto';
import { FlashCardGroupListResponseDto } from './dto/flash-card-group-list-response.dto';
import { UpdateFlashCardGroupDto } from './dto/update-flash-card-group.dto';
import { FlashCardGroup } from './entities/flash-card-group.entity';
import { FlashCardGroupService } from './flash-card-group.service';

@ApiTags('flash-card-group')
@Controller('flash-card-group')
export class FlashCardGroupController {
  constructor(private readonly service: FlashCardGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um grupo de flashcards' })
  @ApiOkResponse({ type: FlashCardGroup })
  create(@Body() dto: CreateFlashCardGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os grupos (com flashcards e contagem)' })
  @ApiOkResponse({ type: FlashCardGroupListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Post(':id/absorb')
  @ApiOperation({
    summary:
      'Absorve outro grupo: move os flashcards dele para este e o exclui',
  })
  @ApiOkResponse({ type: FlashCardGroup })
  @ApiBadRequestResponse({ description: 'Origem e destino são o mesmo grupo' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  absorb(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AbsorbFlashCardGroupDto,
  ) {
    return this.service.absorb(id, dto.sourceId);
  }

  @Get(':id/review/block')
  @ApiOperation({
    summary: 'Flashcards do grupo em ordem aleatória (modo bloco/combinação)',
  })
  @ApiOkResponse({ type: FlashCard, isArray: true })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  reviewBlock(@Param('id', ParseIntPipe) id: number) {
    return this.service.reviewBlock(id);
  }

  @Get(':id/review')
  @ApiOperation({
    summary: 'Flashcards do grupo ordenados para revisão',
  })
  @ApiOkResponse({ type: FlashCard, isArray: true })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  review(@Param('id', ParseIntPipe) id: number) {
    return this.service.review(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um grupo por id (com flashcards e contagem)',
  })
  @ApiOkResponse({ type: FlashCardGroup })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um grupo' })
  @ApiOkResponse({ type: FlashCardGroup })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashCardGroupDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um grupo (e seus flashcards)' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
