import { Module } from '@nestjs/common';
import { ConverterController } from './converter.controller';
import { ExchangeRateService } from './exchange-rate.service';

@Module({
  controllers: [ConverterController],
  providers: [ExchangeRateService],
})
export class ConverterModule {}
