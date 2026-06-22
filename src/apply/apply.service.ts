import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplyListResponseDto } from './dto/apply-list-response.dto';
import { CreateApplyDto } from './dto/create-apply.dto';
import { UpdateApplyDto } from './dto/update-apply.dto';
import { Apply } from './entities/apply.entity';

@Injectable()
export class ApplyService {
  constructor(
    @InjectRepository(Apply)
    private readonly applyRepository: Repository<Apply>,
  ) {}

  create(createApplyDto: CreateApplyDto): Promise<Apply> {
    const apply = this.applyRepository.create(createApplyDto);
    return this.applyRepository.save(apply);
  }

  async findAll(): Promise<ApplyListResponseDto> {
    // findAndCount retorna [registros, total] numa única consulta.
    const [rows, count] = await this.applyRepository.findAndCount({
      order: { date: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Apply> {
    const apply = await this.applyRepository.findOne({ where: { id } });
    if (!apply) {
      throw new NotFoundException(`Apply #${id} não encontrado`);
    }
    return apply;
  }

  async update(id: number, updateApplyDto: UpdateApplyDto): Promise<Apply> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const apply = await this.applyRepository.preload({
      id,
      ...updateApplyDto,
    });
    if (!apply) {
      throw new NotFoundException(`Apply #${id} não encontrado`);
    }
    return this.applyRepository.save(apply);
  }

  async remove(id: number): Promise<void> {
    const result = await this.applyRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Apply #${id} não encontrado`);
    }
  }
}
