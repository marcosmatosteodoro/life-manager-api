import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateDogWalkLocationDto } from './dto/create-dog-walk-location.dto';
import { DogWalkLocationListResponseDto } from './dto/dog-walk-location-list-response.dto';
import { UpdateDogWalkLocationDto } from './dto/update-dog-walk-location.dto';
import { DogWalkLocation } from './entities/dog-walk-location.entity';

@Injectable()
export class DogWalkLocationService {
  constructor(
    @InjectRepository(DogWalkLocation)
    private readonly repository: Repository<DogWalkLocation>,
  ) {}

  create(dto: CreateDogWalkLocationDto): Promise<DogWalkLocation> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(): Promise<DogWalkLocationListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { title: 'ASC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<DogWalkLocation> {
    const location = await this.repository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(tr('dog.locationNotFound', { id }));
    }
    return location;
  }

  async update(
    id: number,
    dto: UpdateDogWalkLocationDto,
  ): Promise<DogWalkLocation> {
    const location = await this.repository.preload({ id, ...dto });
    if (!location) {
      throw new NotFoundException(tr('dog.locationNotFound', { id }));
    }
    return this.repository.save(location);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('dog.locationNotFound', { id }));
    }
  }
}
