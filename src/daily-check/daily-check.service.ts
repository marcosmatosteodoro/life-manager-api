import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDailyCheckDto } from './dto/create-daily-check.dto';
import { DailyCheckListResponseDto } from './dto/daily-check-list-response.dto';
import { UpdateDailyCheckDto } from './dto/update-daily-check.dto';
import { DailyCheck } from './entities/daily-check.entity';

@Injectable()
export class DailyCheckService {
  constructor(
    @InjectRepository(DailyCheck)
    private readonly dailyCheckRepository: Repository<DailyCheck>,
  ) {}

  create(createDailyCheckDto: CreateDailyCheckDto): Promise<DailyCheck> {
    const dailyCheck = this.dailyCheckRepository.create(createDailyCheckDto);
    return this.dailyCheckRepository.save(dailyCheck);
  }

  async findAll(): Promise<DailyCheckListResponseDto> {
    // findAndCount retorna [registros, total] numa única consulta.
    const [rows, count] = await this.dailyCheckRepository.findAndCount({
      order: { date: 'DESC' },
    });
    return { count, rows };
  }

  /**
   * Retorna o check do dia atual; se ainda não existir, cria um (com defaults)
   * e o retorna.
   */
  async today(): Promise<DailyCheck> {
    const date = this.currentDate();
    const existing = await this.dailyCheckRepository.findOne({
      where: { date },
    });
    if (existing) {
      return existing;
    }
    const created = this.dailyCheckRepository.create({ date });
    return this.dailyCheckRepository.save(created);
  }

  async findOne(id: number): Promise<DailyCheck> {
    const dailyCheck = await this.dailyCheckRepository.findOne({
      where: { id },
    });
    if (!dailyCheck) {
      throw new NotFoundException(`DailyCheck #${id} não encontrado`);
    }
    return dailyCheck;
  }

  async update(
    id: number,
    updateDailyCheckDto: UpdateDailyCheckDto,
  ): Promise<DailyCheck> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const dailyCheck = await this.dailyCheckRepository.preload({
      id,
      ...updateDailyCheckDto,
    });
    if (!dailyCheck) {
      throw new NotFoundException(`DailyCheck #${id} não encontrado`);
    }
    return this.dailyCheckRepository.save(dailyCheck);
  }

  async remove(id: number): Promise<void> {
    const result = await this.dailyCheckRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`DailyCheck #${id} não encontrado`);
    }
  }

  /** Data local de hoje no formato YYYY-MM-DD. */
  private currentDate(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}
