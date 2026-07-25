import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { tr } from '../i18n/translate';
import { CreateDogWeightDto } from './dto/create-dog-weight.dto';
import { DogWeightListResponseDto } from './dto/dog-weight-list-response.dto';
import { UpdateDogWeightDto } from './dto/update-dog-weight.dto';
import { DogWeight } from './entities/dog-weight.entity';

@Injectable()
export class DogWeightService {
  constructor(
    @InjectRepository(DogWeight)
    private readonly repository: Repository<DogWeight>,
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
  ) {}

  async create(dto: CreateDogWeightDto): Promise<DogWeight> {
    await this.ensureDogExists(dto.dogId);
    return this.repository.save(this.repository.create(dto));
  }

  /** Lista as pesagens (opcionalmente de um cão), mais recentes primeiro. */
  async findAll(dogId?: number): Promise<DogWeightListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      where: dogId ? { dogId } : {},
      order: { date: 'DESC', id: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<DogWeight> {
    const weight = await this.repository.findOne({ where: { id } });
    if (!weight) {
      throw new NotFoundException(tr('dog.weightNotFound', { id }));
    }
    return weight;
  }

  async update(id: number, dto: UpdateDogWeightDto): Promise<DogWeight> {
    if (dto.dogId !== undefined) await this.ensureDogExists(dto.dogId);
    const weight = await this.repository.preload({ id, ...dto });
    if (!weight) {
      throw new NotFoundException(tr('dog.weightNotFound', { id }));
    }
    return this.repository.save(weight);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('dog.weightNotFound', { id }));
    }
  }

  private async ensureDogExists(dogId: number): Promise<void> {
    const dog = await this.dogRepository.findOne({ where: { id: dogId } });
    if (!dog) {
      throw new NotFoundException(tr('dog.notFound', { id: dogId }));
    }
  }
}
