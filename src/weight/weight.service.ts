import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { WeightListResponseDto } from './dto/weight-list-response.dto';
import { Weight } from './entities/weight.entity';

@Injectable()
export class WeightService {
  constructor(
    @InjectRepository(Weight)
    private readonly weightRepository: Repository<Weight>,
  ) {}

  create(createWeightDto: CreateWeightDto, userId: number): Promise<Weight> {
    const weight = this.weightRepository.create({
      ...createWeightDto,
      creatorId: userId,
    });
    return this.weightRepository.save(weight);
  }

  async findAll(userId: number): Promise<WeightListResponseDto> {
    // findAndCount retorna [registros, total] numa única consulta.
    const [rows, count] = await this.weightRepository.findAndCount({
      where: { creatorId: userId },
      order: { date: 'DESC', time: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number, userId: number): Promise<Weight> {
    const weight = await this.weightRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!weight) {
      throw new NotFoundException(tr('weight.notFound', { id }));
    }
    return weight;
  }

  async update(
    id: number,
    updateWeightDto: UpdateWeightDto,
    userId: number,
  ): Promise<Weight> {
    // Escopo por dono: só edita se o registro for do usuário.
    const weight = await this.findOne(id, userId);
    Object.assign(weight, updateWeightDto);
    return this.weightRepository.save(weight);
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.weightRepository.delete({
      id,
      creatorId: userId,
    });
    if (!result.affected) {
      throw new NotFoundException(tr('weight.notFound', { id }));
    }
  }
}
