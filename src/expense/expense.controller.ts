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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseAudioResponseDto } from './dto/expense-audio-response.dto';
import { ExpenseListResponseDto } from './dto/expense-list-response.dto';
import { ExpenseSummaryResponseDto } from './dto/expense-summary-response.dto';
import { SetExpenseAudioDto } from './dto/set-expense-audio.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseService } from './expense.service';

@ApiTags('expense')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Registra um gasto' })
  @ApiOkResponse({ type: Expense })
  @ApiNotFoundResponse({ description: 'Categoria (categoryId) não encontrada' })
  create(@Body() dto: CreateExpenseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os gastos' })
  @ApiOkResponse({ type: ExpenseListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // Declarado ANTES de :id para não colidir com o param.
  @Get('summary')
  @ApiOperation({ summary: 'Resumo do mês: total e por categoria' })
  @ApiOkResponse({ type: ExpenseSummaryResponseDto })
  summary() {
    return this.service.summary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um gasto por id' })
  @ApiOkResponse({ type: Expense })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um gasto' })
  @ApiOkResponse({ type: Expense })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um gasto' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ----- Descrição em áudio -----

  @Get(':id/audio')
  @ApiOperation({ summary: 'Busca a descrição em áudio do gasto (base64)' })
  @ApiOkResponse({ type: ExpenseAudioResponseDto })
  @ApiNotFoundResponse({ description: 'Sem áudio para este gasto' })
  getAudio(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAudio(id);
  }

  @Post(':id/audio')
  @ApiOperation({ summary: 'Grava/atualiza a descrição em áudio do gasto' })
  @ApiOkResponse({ type: ExpenseAudioResponseDto })
  @ApiNotFoundResponse({ description: 'Gasto não encontrado' })
  setAudio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetExpenseAudioDto,
  ) {
    return this.service.setAudio(id, dto);
  }

  @Delete(':id/audio')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a descrição em áudio do gasto' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Sem áudio para este gasto' })
  removeAudio(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeAudio(id);
  }
}
