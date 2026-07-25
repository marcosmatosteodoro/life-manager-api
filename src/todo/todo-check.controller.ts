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
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTodoCheckDto } from './dto/create-todo-check.dto';
import { TodoCheckListResponseDto } from './dto/todo-check-list-response.dto';
import { TodoCheckQueryDto } from './dto/todo-check-query.dto';
import { UpdateTodoCheckDto } from './dto/update-todo-check.dto';
import { TodoCheck } from './entities/todo-check.entity';
import { TodoCheckService } from './todo-check.service';

@ApiTags('todo-check')
@Controller('todo-check')
export class TodoCheckController {
  constructor(private readonly todoCheckService: TodoCheckService) {}

  // Estática — precisa vir antes de ':id' para não colidir com o ParseIntPipe.
  @Get('today')
  @ApiOperation({
    summary: 'Checks de hoje (cria os que faltam para os afazeres do dia)',
  })
  @ApiOkResponse({ type: TodoCheck, isArray: true })
  today(@CurrentUser() userId: number) {
    return this.todoCheckService.today(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um check para um afazer numa data' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Afazer (todoId) não encontrado' })
  create(@Body() dto: CreateTodoCheckDto, @CurrentUser() userId: number) {
    return this.todoCheckService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Histórico de checks (filtro opcional from/to)' })
  @ApiOkResponse({ type: TodoCheckListResponseDto })
  findAll(@Query() query: TodoCheckQueryDto, @CurrentUser() userId: number) {
    return this.todoCheckService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um check por id' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.todoCheckService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um check (marcar/desmarcar, data)' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoCheckDto,
    @CurrentUser() userId: number,
  ) {
    return this.todoCheckService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um check' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.todoCheckService.remove(id, userId);
  }
}
