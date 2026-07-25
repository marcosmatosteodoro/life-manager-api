import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateDogDto } from './dto/create-dog.dto';
import { DogListResponseDto } from './dto/dog-list-response.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { Dog } from './entities/dog.entity';

@Injectable()
export class DogService {
  constructor(
    @InjectRepository(Dog)
    private readonly repository: Repository<Dog>,
  ) {}

  create(dto: CreateDogDto): Promise<Dog> {
    return this.repository.save(this.repository.create(dto));
  }

  async findAll(): Promise<DogListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { name: 'ASC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Dog> {
    const dog = await this.repository.findOne({ where: { id } });
    if (!dog) {
      throw new NotFoundException(tr('dog.notFound', { id }));
    }
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
}
