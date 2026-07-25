import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { tr } from '../i18n/translate';
import type { UserRole } from '../user/user.constants';
import { ROLES_KEY } from './roles.decorator';

/**
 * Exige que o usuário (papel vindo do JWT, anexado pelo JwtAuthGuard) esteja
 * entre os papéis do `@Roles`. Aplicado por controller/rota via `@UseGuards`,
 * roda **depois** do guard global de JWT. Sem `@Roles`, libera. Deny-by-default:
 * se não houver papel na request, nega.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { role?: UserRole } }>();
    const role = request.user?.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException(tr('auth.forbidden'));
    }
    return true;
  }
}
