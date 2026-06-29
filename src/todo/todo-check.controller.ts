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
  today() {
    return this.todoCheckService.today();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um check para um afazer numa data' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Afazer (todoId) não encontrado' })
  create(@Body() dto: CreateTodoCheckDto) {
    return this.todoCheckService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Histórico de checks (filtro opcional from/to)' })
  @ApiOkResponse({ type: TodoCheckListResponseDto })
  findAll(@Query() query: TodoCheckQueryDto) {
    return this.todoCheckService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um check por id' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todoCheckService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um check (marcar/desmarcar, data)' })
  @ApiOkResponse({ type: TodoCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoCheckDto,
  ) {
    return this.todoCheckService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um check' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todoCheckService.remove(id);
  }
}
