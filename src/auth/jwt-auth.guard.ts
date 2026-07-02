import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { tr } from '../i18n/translate';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard global: exige um JWT válido no header Authorization (Bearer), exceto
 * em rotas marcadas com @Public() (ex.: login, health). Deny-by-default.
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
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      // Anexa o payload à request (útil quando houver creatorId por usuário).
      (request as Request & { user?: { sub: string } }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException(tr('auth.tokenInvalid'));
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
