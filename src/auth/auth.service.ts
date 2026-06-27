import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { LoginDto } from './dto/login.dto';

/**
 * Autenticação simples de usuário único: credenciais vêm do ambiente
 * (AUTH_USERNAME/AUTH_PASSWORD) e o login devolve um JWT assinado.
 *
 * Stopgap para um único usuário. Quando houver multiusuário, migrar para
 * tabela de usuários com senha em hash (bcrypt/Argon2) — ver ProximosPassos.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const expectedUser = this.config.get<string>('AUTH_USERNAME');
    const expectedPass = this.config.get<string>('AUTH_PASSWORD');

    // Sem credenciais configuradas, ninguém entra (fail secure).
    if (!expectedUser || !expectedPass) {
      throw new UnauthorizedException('Autenticação não configurada.');
    }

    const valid =
      this.safeEqual(dto.username, expectedUser) &&
      this.safeEqual(dto.password, expectedPass);
    if (!valid) {
      // Mensagem genérica: não revela se foi o usuário ou a senha.
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const accessToken = await this.jwt.signAsync({ sub: dto.username });
    return { accessToken };
  }

  /** Comparação em tempo constante para mitigar timing attacks. */
  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
