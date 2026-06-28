import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { ExchangeRateService } from './exchange-rate.service';

@ApiTags('converter')
@Controller('converter')
export class ConverterController {
  constructor(private readonly exchangeRate: ExchangeRateService) {}

  @Get('exchange-rate')
  @ApiOperation({
    summary: 'Cotação de câmbio (default USD→BRL); cotação em cache por 1h',
  })
  @ApiOkResponse({ type: ExchangeRateResponseDto })
  @ApiServiceUnavailableResponse({
    description: 'Fonte de câmbio indisponível',
  })
  exchangeRateQuery(@Query() query: ExchangeRateQueryDto) {
    return this.exchangeRate.getRate(query.base, query.target);
  }
}
