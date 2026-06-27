import { SetMetadata } from '@nestjs/common';

/** Chave de metadado que marca uma rota como pública (sem JWT). */
export const IS_PUBLIC_KEY = 'isPublic';

/** Marca uma rota/controller como público — ignorado pelo guard global. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
