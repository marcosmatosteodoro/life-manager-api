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
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { FixedExpenseListResponseDto } from './dto/fixed-expense-list-response.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { FixedExpense } from './entities/fixed-expense.entity';
import { FixedExpenseService } from './fixed-expense.service';

@ApiTags('fixed-expense')
@Controller('fixed-expense')
export class FixedExpenseController {
  constructor(private readonly service: FixedExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um gasto fixo' })
  @ApiOkResponse({ type: FixedExpense })
  create(@Body() dto: CreateFixedExpenseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os gastos fixos (com total mensal)' })
  @ApiOkResponse({ type: FixedExpenseListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um gasto fixo por id' })
  @ApiOkResponse({ type: FixedExpense })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um gasto fixo' })
  @ApiOkResponse({ type: FixedExpense })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFixedExpenseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um gasto fixo' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
