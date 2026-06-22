import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { Weight } from './entities/weight.entity';

@Injectable()
export class WeightService {
  constructor(
    @InjectRepository(Weight)
    private readonly weightRepository: Repository<Weight>,
  ) {}

  create(createWeightDto: CreateWeightDto): Promise<Weight> {
    const weight = this.weightRepository.create(createWeightDto);
    return this.weightRepository.save(weight);
  }

  findAll(): Promise<Weight[]> {
    return this.weightRepository.find({
      order: { date: 'DESC', time: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Weight> {
    const weight = await this.weightRepository.findOne({ where: { id } });
    if (!weight) {
      throw new NotFoundException(`Weight #${id} não encontrado`);
    }
    return weight;
  }

  async update(id: number, updateWeightDto: UpdateWeightDto): Promise<Weight> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const weight = await this.weightRepository.preload({
      id,
      ...updateWeightDto,
    });
    if (!weight) {
      throw new NotFoundException(`Weight #${id} não encontrado`);
    }
    return this.weightRepository.save(weight);
  }

  async remove(id: number): Promise<void> {
    const result = await this.weightRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Weight #${id} não encontrado`);
    }
  }
}
