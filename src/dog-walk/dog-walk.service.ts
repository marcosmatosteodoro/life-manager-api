import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWalkLocation } from '../dog-walk-location/entities/dog-walk-location.entity';
import { tr } from '../i18n/translate';
import { CreateDogWalkDto } from './dto/create-dog-walk.dto';
import { DogWalkListResponseDto } from './dto/dog-walk-list-response.dto';
import { DogWalkPageResponseDto } from './dto/dog-walk-page-response.dto';
import { UpdateDogWalkDto } from './dto/update-dog-walk.dto';
import { DogWalk } from './entities/dog-walk.entity';

@Injectable()
export class DogWalkService {
  constructor(
    @InjectRepository(DogWalk)
    private readonly repository: Repository<DogWalk>,
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
    @InjectRepository(DogWalkLocation)
    private readonly locationRepository: Repository<DogWalkLocation>,
  ) {}

  /** Cria o passeio (chamado ao "Finalizar"). Recurso COMPARTILHADO: sem dono. */
  async create(dto: CreateDogWalkDto): Promise<DogWalk> {
    await this.ensureLocationExists(dto.locationId);
    const dogs = await this.resolveDogs(dto.dogIds);
    const walk = this.repository.create({
      startedAt: new Date(dto.startedAt),
      endedAt: new Date(dto.endedAt),
      durationSeconds: dto.durationSeconds,
      locationId: dto.locationId,
      dogs,
      creatorId: null,
    });
    const saved = await this.repository.save(walk);
    return this.findOne(saved.id);
  }

  /** Lista os passeios (mais recentes primeiro) com cães e local. */
  async findAll(): Promise<DogWalkListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      relations: { dogs: true, location: true },
      order: { startedAt: 'DESC' },
    });
    return { count, rows };
  }

  /**
   * Dados agregados da página de Passeios (uma requisição): passeios + cães +
   * locais (para os seletores). Evita 3 GETs ao abrir a tela. Ordena cães/locais
   * igual aos seus `findAll` (nome/título ASC).
   */
  async page(): Promise<DogWalkPageResponseDto> {
    const [walks, dogs, locations] = await Promise.all([
      this.findAll(),
      this.dogRepository.find({ order: { name: 'ASC' } }),
      this.locationRepository.find({ order: { title: 'ASC' } }),
    ]);
    return { walks: walks.rows, dogs, locations };
  }

  async findOne(id: number): Promise<DogWalk> {
    const walk = await this.repository.findOne({
      where: { id },
      relations: { dogs: true, location: true },
    });
    if (!walk) {
      throw new NotFoundException(tr('dog.walkNotFound', { id }));
    }
    return walk;
  }

  async update(id: number, dto: UpdateDogWalkDto): Promise<DogWalk> {
    const walk = await this.findOne(id);
    if (dto.locationId !== undefined) {
      await this.ensureLocationExists(dto.locationId);
      walk.locationId = dto.locationId;
    }
    if (dto.dogIds !== undefined)
      walk.dogs = await this.resolveDogs(dto.dogIds);
    if (dto.startedAt !== undefined) walk.startedAt = new Date(dto.startedAt);
    if (dto.endedAt !== undefined) walk.endedAt = new Date(dto.endedAt);
    if (dto.durationSeconds !== undefined) {
      walk.durationSeconds = dto.durationSeconds;
    }
    await this.repository.save(walk);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('dog.walkNotFound', { id }));
    }
  }

  private async ensureLocationExists(locationId: number): Promise<void> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId },
    });
    if (!location) {
      throw new NotFoundException(
        tr('dog.locationNotFound', { id: locationId }),
      );
    }
  }

  /** Resolve os cães pelos ids, exigindo que todos existam. */
  private async resolveDogs(dogIds: number[]): Promise<Dog[]> {
    const ids = [...new Set(dogIds)];
    const dogs = await this.dogRepository.findBy({ id: In(ids) });
    if (dogs.length !== ids.length) {
      throw new NotFoundException(tr('dog.someDogNotFound'));
    }
    return dogs;
  }
}
