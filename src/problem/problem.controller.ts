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
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemListResponseDto } from './dto/problem-list-response.dto';
import { ReorderProblemDto } from './dto/reorder-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Problem } from './entities/problem.entity';
import { PROBLEM_STATUSES, type ProblemStatus } from './problem.constants';
import { ProblemService } from './problem.service';

@ApiTags('problem')
@Controller('problem')
export class ProblemController {
  constructor(private readonly service: ProblemService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um problema' })
  @ApiOkResponse({ type: Problem })
  create(@Body() dto: CreateProblemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os problemas (opcionalmente por status)' })
  @ApiQuery({ name: 'status', enum: PROBLEM_STATUSES, required: false })
  @ApiOkResponse({ type: ProblemListResponseDto })
  findAll(@Query('status') status?: ProblemStatus) {
    // status inválido é tratado como "sem filtro" (não quebra a listagem).
    const valid = PROBLEM_STATUSES.includes(status as ProblemStatus)
      ? status
      : undefined;
    return this.service.findAll(valid);
  }

  // Declarado ANTES de :id para não colidir com o param.
  @Patch('reorder')
  @ApiOperation({ summary: 'Reordena todos os problemas (position = índice + 1)' })
  @ApiOkResponse({ type: ProblemListResponseDto })
  reorder(@Body() dto: ReorderProblemDto) {
    return this.service.reorder(dto.orderedIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um problema por id' })
  @ApiOkResponse({ type: Problem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza título, descrição e/ou status' })
  @ApiOkResponse({ type: Problem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProblemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um problema' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
