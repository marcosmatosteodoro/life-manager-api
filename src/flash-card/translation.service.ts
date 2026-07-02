import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tr } from '../i18n/translate';

/** Formato (parcial) da resposta da MyMemory. */
interface MyMemoryResponse {
  responseStatus?: number | string;
  responseData?: { translatedText?: string };
}

const ENDPOINT = 'https://api.mymemory.translated.net/get';
const TIMEOUT_MS = 8000;

/**
 * Tradução via MyMemory (gratuita, sem chave). O e-mail (MYMEMORY_EMAIL) é
 * opcional e só amplia a cota diária. Fail secure: qualquer falha vira um
 * 503 genérico, sem vazar detalhes do provedor.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(private readonly config: ConfigService) {}

  /** Traduz um texto curto de inglês para português (pt-BR). */
  async translate(text: string, from = 'en', to = 'pt-BR'): Promise<string> {
    const term = text.trim();
    if (!term) {
      throw new ServiceUnavailableException(
        tr('flashcards.nothingToTranslate'),
      );
    }

    const params = new URLSearchParams({
      q: term,
      langpair: `${from}|${to}`,
    });
    const email = this.config.get<string>('MYMEMORY_EMAIL');
    if (email) params.set('de', email);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body = (await res.json()) as MyMemoryResponse;
      const status = Number(body.responseStatus);
      const translated = body.responseData?.translatedText?.trim();
      if (status !== 200 || !translated) {
        // Cota esgotada ou resposta inválida vêm com status != 200.
        throw new Error(
          `responseStatus ${body.responseStatus ?? 'desconhecido'}`,
        );
      }
      return translated;
    } catch (error) {
      // Não logamos o termo nem o corpo da resposta (evita vazar conteúdo).
      this.logger.error(
        `Falha ao traduzir: ${error instanceof Error ? error.message : 'erro'}`,
      );
      throw new ServiceUnavailableException(
        tr('flashcards.translationUnavailable'),
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
