import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PhotoResponseDto } from '../common/dto/photo-response.dto';
import { SetPhotoDto } from '../common/dto/set-photo.dto';
import {
  delProfilePhoto,
  putProfilePhoto,
  readProfilePhotoBase64,
} from '../common/photo-blob.storage';
import { tr } from '../i18n/translate';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserPhoto } from './entities/user-photo.entity';
import { User } from './entities/user.entity';

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
        field === 'email' ? tr('user.emailInUse') : tr('user.usernameInUse'),
      );
    }
  }
}
