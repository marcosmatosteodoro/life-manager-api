import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extrai o id do usuário (`sub` do JWT) que o JwtAuthGuard anexou em
 * `request.user`. Uso: `metodo(@CurrentUser() userId: number)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: { sub: string | number } }>();
    return Number(request.user?.sub);
  },
);
