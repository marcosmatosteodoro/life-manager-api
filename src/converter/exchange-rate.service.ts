import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';

/** Formato (parcial) da resposta da open.er-api.com. */
interface ErApiResponse {
  result?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
}

const SOURCE = 'https://open.er-api.com/v6/latest';
const TIMEOUT_MS = 8000;
const TTL_MS = 60 * 60 * 1000; // 1h: cotação não muda a cada request.

/**
 * Cotação de câmbio via open.er-api.com (grátis, sem chave). Cache em memória
 * por base (TTL 1h). Fail secure: falha de rede/fonte vira 503 genérico.
 */
@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly cache = new Map<
    string,
    { at: number; rates: Record<string, number>; date: string }
  >();

  async getRate(
    base = 'USD',
    target = 'BRL',
  ): Promise<ExchangeRateResponseDto> {
    const from = base.toUpperCase();
    const to = target.toUpperCase();
    const { rates, date } = await this.getRates(from);

    const rate = rates[to];
    if (rate == null) {
      throw new BadRequestException(`Moeda de destino não suportada: ${to}`);
    }
    return { base: from, target: to, rate, date };
  }

  private async getRates(
    base: string,
  ): Promise<{ rates: Record<string, number>; date: string }> {
    const cached = this.cache.get(base);
    if (cached && Date.now() - cached.at < TTL_MS) {
      return { rates: cached.rates, date: cached.date };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${SOURCE}/${base}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body = (await res.json()) as ErApiResponse;
      if (body.result !== 'success' || !body.rates) {
        throw new Error(`result ${body.result ?? 'desconhecido'}`);
      }
      const date = body.time_last_update_utc ?? '';
      this.cache.set(base, { at: Date.now(), rates: body.rates, date });
      return { rates: body.rates, date };
    } catch (error) {
      this.logger.error(
        `Falha ao buscar cotação (${base}): ${
          error instanceof Error ? error.message : 'erro'
        }`,
      );
      throw new ServiceUnavailableException(
        'Serviço de câmbio indisponível no momento. Use a taxa manual.',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
