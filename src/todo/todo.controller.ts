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
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoListResponseDto } from './dto/todo-list-response.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';

@ApiTags('todo')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um afazer' })
  @ApiOkResponse({ type: Todo })
  create(@Body() dto: CreateTodoDto, @CurrentUser() userId: number) {
    return this.todoService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os afazeres' })
  @ApiOkResponse({ type: TodoListResponseDto })
  findAll(@CurrentUser() userId: number) {
    return this.todoService.findAll(userId);
  }

  // Estática — precisa vir antes de ':id' para não colidir com o ParseIntPipe.
  @Get('tags')
  @ApiOperation({ summary: 'Lista as tags distintas já usadas' })
  @ApiOkResponse({ type: String, isArray: true })
  tags(@CurrentUser() userId: number) {
    return this.todoService.tags(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um afazer por id' })
  @ApiOkResponse({ type: Todo })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.todoService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um afazer' })
  @ApiOkResponse({ type: Todo })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
    @CurrentUser() userId: number,
  ) {
    return this.todoService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um afazer (e seus checks em cascata)' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.todoService.remove(id, userId);
  }
}
