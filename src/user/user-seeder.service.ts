import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { hashPassword } from '../auth/password.util';
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from './user.constants';
import { UserService } from './user.service';

/**
 * Semeia um admin inicial quando não há nenhum usuário — bootstrap idempotente
 * que funciona em dev (synchronize) e prod (após migration). O admin nasce com
 * senha fraca (`admin`) mas com `mustChangePassword`, forçando a troca no 1º
 * login (mitiga a credencial padrão). A senha não é logada.
 */
@Injectable()
export class UserSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeederService.name);

  constructor(private readonly users: UserService) {}

  async onApplicationBootstrap(): Promise<void> {
    if ((await this.users.count()) > 0) return;

    await this.users.create({
      username: 'admin',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await hashPassword('admin'),
      theme: DEFAULT_THEME,
      language: DEFAULT_LANGUAGE,
      mustChangePassword: true,
    });
    this.logger.warn(
      'Usuário admin inicial criado (admin/admin). Troque a senha no primeiro login.',
    );
  }
}
