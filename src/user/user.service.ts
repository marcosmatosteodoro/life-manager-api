import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { hashPassword } from '../auth/password.util';
import { PhotoResponseDto } from '../common/dto/photo-response.dto';
import { SetPhotoDto } from '../common/dto/set-photo.dto';
import {
  delProfilePhoto,
  putProfilePhoto,
  readProfilePhotoBase64,
} from '../common/photo-blob.storage';
import { tr } from '../i18n/translate';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserPhoto } from './entities/user-photo.entity';
import { User } from './entities/user.entity';
import { DEFAULT_USER_ROLE } from './user.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(UserPhoto)
    private readonly photoRepository: Repository<UserPhoto>,
  ) {}

  /** Usado pelo auth (login). Retorna a entidade crua (com hash). */
  findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  /** Entidade crua por id (auth/change-password). */
  async findByIdOrThrow(id: number): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(tr('user.notFound', { id }));
    }
    return user;
  }

  /** Perfil do usuário logado (sem passwordHash). */
  async getMe(id: number): Promise<UserResponseDto> {
    const user = await this.findByIdOrThrow(id);
    return UserResponseDto.from(user, await this.hasPhoto(id));
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
    if (dto.customColors !== undefined) user.customColors = dto.customColors;

    const saved = await this.repository.save(user);
    return UserResponseDto.from(saved, await this.hasPhoto(id));
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

  // ----- Administração de usuários (somente admin) -----

  /** Lista todos os usuários (sem passwordHash). */
  async listAll(): Promise<UserResponseDto[]> {
    const users = await this.repository.find({ order: { id: 'ASC' } });
    return users.map((u) => UserResponseDto.from(u));
  }

  /** Cria um usuário (admin). Valida unicidade e faz o hash da senha. */
  async adminCreate(dto: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureUnique('username', dto.username);
    await this.ensureUnique('email', dto.email);
    const user = await this.repository.save(
      this.repository.create({
        username: dto.username,
        email: dto.email,
        name: dto.name,
        passwordHash: await hashPassword(dto.password),
        role: dto.role ?? DEFAULT_USER_ROLE,
        // Senha definida pelo admin é provisória: força a troca no 1º login.
        mustChangePassword: true,
      }),
    );
    return UserResponseDto.from(user);
  }

  /** Edita um usuário (admin): nome/usuário/e-mail/papel/senha. */
  async adminUpdate(
    id: number,
    dto: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
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
    if (dto.role !== undefined && dto.role !== user.role) {
      // Rebaixar o último admin deixaria o app sem admin: bloqueia.
      if (dto.role !== 'admin') await this.ensureNotLastAdmin();
      user.role = dto.role;
    }
    if (dto.password) {
      user.passwordHash = await hashPassword(dto.password);
      user.mustChangePassword = false;
    }
    return UserResponseDto.from(await this.repository.save(user));
  }

  /** Remove um usuário (admin). Não pode remover a si mesmo nem o último admin. */
  async adminRemove(id: number, currentUserId: number): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException(tr('user.cannotDeleteSelf'));
    }
    const user = await this.findByIdOrThrow(id);
    if (user.role === 'admin') await this.ensureNotLastAdmin();
    await this.repository.delete(id);
  }

  /** Garante que há mais de um admin (para não ficar sem nenhum). */
  private async ensureNotLastAdmin(): Promise<void> {
    const admins = await this.repository.count({ where: { role: 'admin' } });
    if (admins <= 1) {
      throw new BadRequestException(tr('user.lastAdmin'));
    }
  }

  // ----- Foto de perfil (Vercel Blob privado; Postgres guarda a referência) -----

  /** Foto de perfil em base64 (lida do Blob sob demanda). */
  async getPhoto(id: number): Promise<PhotoResponseDto> {
    const photo = await this.photoRepository.findOne({ where: { userId: id } });
    if (!photo) {
      throw new NotFoundException(tr('user.photoNotFound', { id }));
    }
    return {
      data: await readProfilePhotoBase64(photo.pathname),
      mimeType: photo.mimeType,
    };
  }

  /** Define/substitui a foto de perfil (apaga o blob anterior, se houver). */
  async setPhoto(id: number, dto: SetPhotoDto): Promise<PhotoResponseDto> {
    await this.findByIdOrThrow(id); // garante 404 se o usuário não existe
    const existing = await this.photoRepository.findOne({
      where: { userId: id },
    });
    const stored = await putProfilePhoto('users', id, dto.data, dto.mimeType);
    if (existing) {
      await delProfilePhoto(existing.url);
      await this.photoRepository.update(existing.id, {
        pathname: stored.pathname,
        url: stored.url,
        mimeType: dto.mimeType,
      });
    } else {
      await this.photoRepository.save(
        this.photoRepository.create({
          userId: id,
          pathname: stored.pathname,
          url: stored.url,
          mimeType: dto.mimeType,
        }),
      );
    }
    return { data: dto.data, mimeType: dto.mimeType };
  }

  async removePhoto(id: number): Promise<void> {
    const photo = await this.photoRepository.findOne({ where: { userId: id } });
    if (!photo) {
      throw new NotFoundException(tr('user.photoNotFound', { id }));
    }
    await delProfilePhoto(photo.url);
    await this.photoRepository.delete(photo.id);
  }

  /** Existe foto de perfil? (sem carregar o binário). */
  private async hasPhoto(id: number): Promise<boolean> {
    return (await this.photoRepository.count({ where: { userId: id } })) > 0;
  }

  /**
   * Garante que nenhum OUTRO usuário já usa o valor do campo único. Sem
   * `exceptId` (criação), verifica contra todos.
   */
  private async ensureUnique(
    field: 'username' | 'email',
    value: string,
    exceptId?: number,
  ): Promise<void> {
    const clash = await this.repository.findOne({
      where:
        exceptId != null
          ? { [field]: value, id: Not(exceptId) }
          : { [field]: value },
    });
    if (clash) {
      throw new ConflictException(
        field === 'email' ? tr('user.emailInUse') : tr('user.usernameInUse'),
      );
    }
  }
}
