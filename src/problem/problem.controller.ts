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
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemAudioResponseDto } from './dto/problem-audio-response.dto';
import { ProblemListResponseDto } from './dto/problem-list-response.dto';
import { ReorderProblemDto } from './dto/reorder-problem.dto';
import { SetProblemAudioDto } from './dto/set-problem-audio.dto';
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
  create(@Body() dto: CreateProblemDto, @CurrentUser() userId: number) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os problemas (opcionalmente por status)' })
  @ApiQuery({ name: 'status', enum: PROBLEM_STATUSES, required: false })
  @ApiOkResponse({ type: ProblemListResponseDto })
  findAll(
    @CurrentUser() userId: number,
    @Query('status') status?: ProblemStatus,
  ) {
    // status inválido é tratado como "sem filtro" (não quebra a listagem).
    const valid = PROBLEM_STATUSES.includes(status as ProblemStatus)
      ? status
      : undefined;
    return this.service.findAll(userId, valid);
  }

  // Declarado ANTES de :id para não colidir com o param.
  @Patch('reorder')
  @ApiOperation({
    summary: 'Reordena todos os problemas (position = índice + 1)',
  })
  @ApiOkResponse({ type: ProblemListResponseDto })
  reorder(@Body() dto: ReorderProblemDto, @CurrentUser() userId: number) {
    return this.service.reorder(dto.orderedIds, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um problema por id' })
  @ApiOkResponse({ type: Problem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.service.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza título, descrição e/ou status' })
  @ApiOkResponse({ type: Problem })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProblemDto,
    @CurrentUser() userId: number,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um problema' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.service.remove(id, userId);
  }

  // ----- Nota de voz (áudio) do problema -----

  @Get(':id/audio')
  @ApiOperation({ summary: 'Busca a nota de voz do problema (base64)' })
  @ApiOkResponse({ type: ProblemAudioResponseDto })
  @ApiNotFoundResponse({ description: 'Sem áudio para este problema' })
  getAudio(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.service.getAudio(id, userId);
  }

  @Post(':id/audio')
  @ApiOperation({ summary: 'Grava/atualiza a nota de voz do problema' })
  @ApiOkResponse({ type: ProblemAudioResponseDto })
  @ApiNotFoundResponse({ description: 'Problema não encontrado' })
  setAudio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProblemAudioDto,
    @CurrentUser() userId: number,
  ) {
    return this.service.setAudio(id, dto, userId);
  }

  @Delete(':id/audio')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a nota de voz do problema' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Sem áudio para este problema' })
  removeAudio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.service.removeAudio(id, userId);
  }
}
