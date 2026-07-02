import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { tr } from '../i18n/translate';

interface CompleteParams {
  /** Instruções fixas do recurso (role "system"). */
  system: string;
  /** Conteúdo do usuário a ser processado (role "user"). */
  user: string;
  /** Força a resposta a ser um objeto JSON válido. */
  json?: boolean;
}

/**
 * Serviço genérico de IA: encapsula o provedor (OpenAI) e a chave.
 * É agnóstico de recurso — quem chama traz o prompt e conhece o formato da
 * resposta. Trocar de provedor no futuro muda só este arquivo.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  // Criado sob demanda para não derrubar o boot quando a chave não está setada.
  private client: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  private getClient(): OpenAI {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      // Fail secure: sem chave, o recurso de IA não opera.
      throw new ServiceUnavailableException(tr('ai.notConfigured'));
    }
    this.client = new OpenAI({ apiKey });
    return this.client;
  }

  /** Chamada de texto ao modelo. Retorna o conteúdo bruto devolvido. */
  async complete({ system, user, json }: CompleteParams): Promise<string> {
    const client = this.getClient();
    const model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini');

    try {
      const completion = await client.chat.completions.create({
        model,
        // Temperatura baixa: tarefa de correção pede saída consistente.
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Resposta vazia do provedor de IA.');
      }
      return content;
    } catch (error) {
      // Não logamos o conteúdo enviado (pode ter dados pessoais) nem expomos
      // o erro cru do provedor ao cliente.
      this.logger.error(
        `Falha ao chamar o provedor de IA: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(tr('ai.unavailable'));
    }
  }
}
