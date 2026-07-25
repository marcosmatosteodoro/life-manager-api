import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PhotoResponseDto } from '../common/dto/photo-response.dto';
import { SetPhotoDto } from '../common/dto/set-photo.dto';
import {
  delProfilePhoto,
  putProfilePhoto,
  readProfilePhotoBase64,
} from '../common/photo-blob.storage';
import { tr } from '../i18n/translate';
import { CreateDogDto } from './dto/create-dog.dto';
import { DogListResponseDto } from './dto/dog-list-response.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogPhoto } from './entities/dog-photo.entity';
import { Dog } from './entities/dog.entity';

@Injectable()
export class DogService {
  constructor(
    @InjectRepository(Dog)
    private readonly repository: Repository<Dog>,
    @InjectRepository(DogPhoto)
    private readonly photoRepository: Repository<DogPhoto>,
  ) {}

  create(dto: CreateDogDto): Promise<Dog> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(): Promise<DogListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { name: 'ASC' },
    });
    await this.attachHasPhoto(rows);
    return { count, rows };
  }

  async findOne(id: number): Promise<Dog> {
    const dog = await this.repository.findOne({ where: { id } });
    if (!dog) {
      throw new NotFoundException(tr('dog.notFound', { id }));
    }
    await this.attachHasPhoto([dog]);
    return dog;
  }

  async update(id: number, dto: UpdateDogDto): Promise<Dog> {
    const dog = await this.repository.preload({ id, ...dto });
    if (!dog) {
      throw new NotFoundException(tr('dog.notFound', { id }));
    }
    return this.repository.save(dog);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('dog.notFound', { id }));
    }
  }

  // ----- Foto de perfil (Vercel Blob privado; Postgres guarda a referência) -----

  /** Foto de perfil em base64 (lida do Blob sob demanda). */
  async getPhoto(id: number): Promise<PhotoResponseDto> {
    const photo = await this.photoRepository.findOne({ where: { dogId: id } });
    if (!photo) {
      throw new NotFoundException(tr('dog.photoNotFound', { id }));
    }
    return {
      data: await readProfilePhotoBase64(photo.pathname),
      mimeType: photo.mimeType,
    };
  }

  /** Define/substitui a foto de perfil (apaga o blob anterior, se houver). */
  async setPhoto(id: number, dto: SetPhotoDto): Promise<PhotoResponseDto> {
    await this.findOne(id); // garante 404 se o cão não existe
    const existing = await this.photoRepository.findOne({
      where: { dogId: id },
    });
    const stored = await putProfilePhoto('dogs', id, dto.data, dto.mimeType);
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
          dogId: id,
          pathname: stored.pathname,
          url: stored.url,
          mimeType: dto.mimeType,
        }),
      );
    }
    return { data: dto.data, mimeType: dto.mimeType };
  }

  async removePhoto(id: number): Promise<void> {
    const photo = await this.photoRepository.findOne({ where: { dogId: id } });
    if (!photo) {
      throw new NotFoundException(tr('dog.photoNotFound', { id }));
    }
    await delProfilePhoto(photo.url);
    await this.photoRepository.delete(photo.id);
  }

  /** Marca hasPhoto sem carregar o binário (uma query pelos ids). */
  private async attachHasPhoto(rows: Dog[]): Promise<void> {
    if (rows.length === 0) return;
    const photos = await this.photoRepository.find({
      where: { dogId: In(rows.map((r) => r.id)) },
      select: { dogId: true },
    });
    const withPhoto = new Set(photos.map((p) => p.dogId));
    for (const row of rows) row.hasPhoto = withPhoto.has(row.id);
  }
}
