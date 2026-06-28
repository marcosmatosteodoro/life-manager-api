import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

/** Monta um Response falso para o fetch global. */
const mockResponse = (ok: boolean, body: unknown): Response =>
  ({
    ok,
    status: ok ? 200 : 503,
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    service = new ExchangeRateService();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => jest.clearAllMocks());

  it('retorna a taxa da moeda destino', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, {
        result: 'success',
        time_last_update_utc: 'data',
        rates: { BRL: 5.42, EUR: 0.9 },
      }),
    );

    const result = await service.getRate('USD', 'BRL');

    expect(result).toEqual({
      base: 'USD',
      target: 'BRL',
      rate: 5.42,
      date: 'data',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('usa cache na segunda chamada (não refaz o fetch)', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, { result: 'success', rates: { BRL: 5 } }),
    );

    await service.getRate('USD', 'BRL');
    await service.getRate('USD', 'BRL');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('normaliza os códigos para maiúsculas', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, { result: 'success', rates: { BRL: 5 } }),
    );

    const result = await service.getRate('usd', 'brl');

    expect(result.base).toBe('USD');
    expect(result.target).toBe('BRL');
  });

  it('lança BadRequest quando a moeda destino não existe', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, { result: 'success', rates: { BRL: 5 } }),
    );

    await expect(service.getRate('USD', 'XYZ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança 503 quando o fetch falha', async () => {
    fetchMock.mockResolvedValue(mockResponse(false, {}));

    await expect(service.getRate('USD', 'BRL')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('lança 503 quando a fonte responde com erro', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, { result: 'error', rates: null }),
    );

    await expect(service.getRate('USD', 'BRL')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
