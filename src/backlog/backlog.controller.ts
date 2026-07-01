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
  Query,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BACKLOG_STATUSES, type BacklogStatus } from './backlog.constants';
import { BacklogService } from './backlog.service';
import { BacklogListResponseDto } from './dto/backlog-list-response.dto';
import { CreateBacklogItemDto } from './dto/create-backlog-item.dto';
import { ReorderBacklogDto } from './dto/reorder-backlog.dto';
import { UpdateBacklogItemDto } from './dto/update-backlog-item.dto';
import { BacklogItem } from './entities/backlog-item.entity';

@ApiTags('backlog')
@Controller('backlog')
export class BacklogController {
  constructor(private readonly service: BacklogService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um item pendente (no fim da fila)' })
  @ApiOkResponse({ type: BacklogItem })
  create(@Body() dto: CreateBacklogItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os itens (opcionalmente por status)' })
  @ApiQuery({ name: 'status', enum: BACKLOG_STATUSES, required: false })
  @ApiOkResponse({ type: BacklogListResponseDto })
  findAll(@Query('status') status?: BacklogStatus) {
    // status inválido é tratado como "sem filtro" (não quebra a listagem).
    const valid = BACKLOG_STATUSES.includes(status as BacklogStatus)
      ? status
      : undefined;
    return this.service.findAll(valid);
  }

  // Declarado ANTES de :id para não colidir com o param.
  @Patch('reorder')
  @ApiOperation({ summary: 'Reordena os pendentes (position = índice + 1)' })
  @ApiOkResponse({ type: BacklogListResponseDto })
  reorder(@Body() dto: ReorderBacklogDto) {
    return this.service.reorder(dto.orderedIds);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Conclui um item (reorganiza as posições)' })
  @ApiOkResponse({ type: BacklogItem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.service.complete(id);
  }

  @Patch(':id/reopen')
  @ApiOperation({ summary: 'Reabre um item concluído (volta ao fim da fila)' })
  @ApiOkResponse({ type: BacklogItem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  reopen(@Param('id', ParseIntPipe) id: number) {
    return this.service.reopen(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita nome/descrição' })
  @ApiOkResponse({ type: BacklogItem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBacklogItemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um item (compacta as posições)' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
