import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate limit por usuário autenticado (`sub` do JWT anexado pelo JwtAuthGuard)
 * quando disponível; senão, por IP. Assim, atrás de um proxy (IP compartilhado)
 * um usuário não estoura o limite de outro, e o custo de IA fica limitado por
 * usuário. O fallback por IP protege rotas públicas (ex.: login/força bruta).
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const sub = (req as { user?: { sub?: string } }).user?.sub;
    if (sub) return Promise.resolve(`user:${sub}`);
    return super.getTracker(req);
  }
}
