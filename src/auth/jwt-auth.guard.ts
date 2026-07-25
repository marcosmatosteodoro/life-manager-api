import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'node:crypto';
import { Request } from 'express';
import { tr } from '../i18n/translate';
import { EXTENSION_ALLOWED_KEY } from './extension.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Identidade anexada à request quando entra pelo token fixo da extensão. */
type RequestUser = { sub: string; role?: string; isExtension?: boolean };

/**
 * Guard global: exige um JWT válido no header Authorization (Bearer), exceto
 * em rotas marcadas com @Public() (ex.: login, health). Deny-by-default.
 *
 * Alternativa para a **extensão do Chrome**: se o Bearer for igual ao
 * `EXTENSION_API_TOKEN` (env), libera — mas **só** nas rotas com
 * `@ExtensionAllowed()`; em qualquer outra, o token fixo é negado (403).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException(tr('auth.tokenMissing'));
    }

    // Token fixo da extensão: só vale nas rotas marcadas com @ExtensionAllowed().
    const extensionToken = process.env.EXTENSION_API_TOKEN;
    if (extensionToken && this.safeEqual(token, extensionToken)) {
      const allowed = this.reflector.getAllAndOverride<boolean>(
        EXTENSION_ALLOWED_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!allowed) {
        throw new ForbiddenException(tr('auth.forbidden'));
      }
      (request as Request & { user?: RequestUser }).user = {
        sub: 'extension',
        role: 'member',
        isExtension: true,
      };
      return true;
    }

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        role?: string;
      }>(token);
      // Anexa o payload à request (id + papel, usados por CurrentUser/RolesGuard).
      (request as Request & { user?: RequestUser }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException(tr('auth.tokenInvalid'));
    }
  }

  /** Comparação de tokens em tempo constante (evita timing attack). */
  private safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
