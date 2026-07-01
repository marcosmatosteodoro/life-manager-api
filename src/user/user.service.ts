import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /** Usado pelo auth (login). Retorna a entidade crua (com hash). */
  findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  /** Entidade crua por id (auth/change-password). */
  async findByIdOrThrow(id: number): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário #${id} não encontrado`);
    }
    return user;
  }

  /** Perfil do usuário logado (sem passwordHash). */
  async getMe(id: number): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.findByIdOrThrow(id));
  }

  /** Atualiza o próprio perfil; valida unicidade de username/email. */
  async updateMe(id: number, dto: UpdateMeDto): Promise<UserResponseDto> {
    const user = await this.findByIdOrThrow(id);

    if (dto.username && dto.username !== user.username) {
      await this.ensureUnique('username', dto.username, id);
      user.username = dto.username;
    }
    if (dto.email && dto.email !== user.email) {
      await this.ensureUnique('email', dto.email, id);
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.heightCm !== undefined) user.heightCm = dto.heightCm;
    if (dto.theme !== undefined) user.theme = dto.theme;
    if (dto.language !== undefined) user.language = dto.language;

    return UserResponseDto.from(await this.repository.save(user));
  }

  /** Grava novo hash de senha e desliga a obrigatoriedade de troca. */
  async setPassword(id: number, passwordHash: string): Promise<void> {
    const user = await this.findByIdOrThrow(id);
    user.passwordHash = passwordHash;
    user.mustChangePassword = false;
    await this.repository.save(user);
  }

  /** Cria um usuário (usado pelo seeder). */
  create(data: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(data));
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  /** Garante que nenhum OUTRO usuário já usa o valor do campo único. */
  private async ensureUnique(
    field: 'username' | 'email',
    value: string,
    exceptId: number,
  ): Promise<void> {
    const clash = await this.repository.findOne({
      where: { [field]: value, id: Not(exceptId) },
    });
    if (clash) {
      throw new ConflictException(
        field === 'email'
          ? 'E-mail já está em uso.'
          : 'Nome de usuário já está em uso.',
      );
    }
  }
}
