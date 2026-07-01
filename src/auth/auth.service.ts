import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password.util';

/**
 * Autenticação contra a tabela `users` (senha em hash scrypt). O JWT carrega o
 * `sub` = id do usuário. Substitui o antigo login por variáveis de ambiente.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UserService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; mustChangePassword: boolean }> {
    const user = await this.users.findByUsername(dto.username);
    // Mesmo caminho/mensagem para usuário inexistente ou senha errada
    // (não revela qual dos dois falhou).
    const valid =
      !!user && (await verifyPassword(dto.password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken, mustChangePassword: user.mustChangePassword };
  }

  /** Troca a própria senha (exige a atual). Zera `mustChangePassword`. */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.findByIdOrThrow(userId);
    const valid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }
    await this.users.setPassword(userId, await hashPassword(dto.newPassword));
  }
}
