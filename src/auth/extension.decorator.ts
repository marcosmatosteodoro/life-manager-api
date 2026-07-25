import { SetMetadata } from '@nestjs/common';

/** Chave de metadado: rota acessível pelo token fixo da extensão. */
export const EXTENSION_ALLOWED_KEY = 'extensionAllowed';

/**
 * Marca a rota/controller como acessível pelo **token fixo da extensão**
 * (`EXTENSION_API_TOKEN`). Sem este decorator, o token fixo é negado (o JWT de
 * usuário continua funcionando normalmente). Escopo mínimo: só as rotas que a
 * extensão do Chrome precisa (país/empresa/candidatura).
 */
export const ExtensionAllowed = () => SetMetadata(EXTENSION_ALLOWED_KEY, true);
