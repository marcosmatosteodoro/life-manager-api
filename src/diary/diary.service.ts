import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { DiaryListResponseDto } from './dto/diary-list-response.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Diary } from './entities/diary.entity';
import { DiaryType } from './enums/diary-type.enum';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepository: Repository<Diary>,
  ) {}

  create(createDiaryDto: CreateDiaryDto): Promise<Diary> {
    const diary = this.diaryRepository.create(createDiaryDto);
    return this.diaryRepository.save(diary);
  }

  /** Lista os registros; filtra por type quando informado. */
  async findAll(type?: DiaryType): Promise<DiaryListResponseDto> {
    const [rows, count] = await this.diaryRepository.findAndCount({
      where: type ? { type } : {},
      order: { day: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Diary> {
    const diary = await this.diaryRepository.findOne({ where: { id } });
    if (!diary) {
      throw new NotFoundException(`Diary #${id} não encontrado`);
    }
    return diary;
  }

  async update(id: number, updateDiaryDto: UpdateDiaryDto): Promise<Diary> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const diary = await this.diaryRepository.preload({
      id,
      ...updateDiaryDto,
    });
    if (!diary) {
      throw new NotFoundException(`Diary #${id} não encontrado`);
    }
    return this.diaryRepository.save(diary);
  }

  async remove(id: number): Promise<void> {
    const result = await this.diaryRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Diary #${id} não encontrado`);
    }
  }
}
