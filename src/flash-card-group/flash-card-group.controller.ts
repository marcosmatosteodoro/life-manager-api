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

  @Get(':id')
  @ApiOperation({ summary: 'Busca um grupo por id (com flashcards e contagem)' })
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
