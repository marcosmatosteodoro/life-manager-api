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
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtListResponseDto } from './dto/debt-list-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { Debt } from './entities/debt.entity';
import { DebtService } from './debt.service';

@ApiTags('debt')
@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma dívida' })
  @ApiOkResponse({ type: Debt })
  create(@Body() dto: CreateDebtDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as dívidas (com saldo e totais)' })
  @ApiOkResponse({ type: DebtListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma dívida (com quitações)' })
  @ApiOkResponse({ type: Debt })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma dívida' })
  @ApiOkResponse({ type: Debt })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDebtDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma dívida (e reverte os gastos gerados)' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ----- Quitações -----

  @Post(':id/payments')
  @ApiOperation({ summary: 'Registra uma quitação (parcial ou total)' })
  @ApiOkResponse({ type: Debt })
  @ApiNotFoundResponse({ description: 'Dívida não encontrada' })
  @ApiBadRequestResponse({ description: 'Valor inválido ou dívida já quitada' })
  addPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDebtPaymentDto,
  ) {
    return this.service.addPayment(id, dto);
  }

  @Delete(':id/payments/:paymentId')
  @ApiOperation({ summary: 'Remove uma quitação (e apaga o gasto gerado)' })
  @ApiOkResponse({ type: Debt })
  @ApiNotFoundResponse({ description: 'Quitação não encontrada' })
  removePayment(
    @Param('id', ParseIntPipe) id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.service.removePayment(id, paymentId);
  }
}
