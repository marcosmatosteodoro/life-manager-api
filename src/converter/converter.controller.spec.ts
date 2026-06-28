import { Test, TestingModule } from '@nestjs/testing';
import { ConverterController } from './converter.controller';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { ExchangeRateService } from './exchange-rate.service';

describe('ConverterController', () => {
  let controller: ConverterController;
  let service: jest.Mocked<ExchangeRateService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ExchangeRateService>> = {
      getRate: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConverterController],
      providers: [{ provide: ExchangeRateService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ConverterController);
    service = module.get(ExchangeRateService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('repassa base e target do query para o service', async () => {
    const payload: ExchangeRateResponseDto = {
      base: 'CAD',
      target: 'BRL',
      rate: 4,
      date: 'data',
    };
    service.getRate.mockResolvedValue(payload);

    await expect(
      controller.exchangeRateQuery({ base: 'CAD', target: 'BRL' }),
    ).resolves.toEqual(payload);
    expect(service.getRate).toHaveBeenCalledWith('CAD', 'BRL');
  });
});
