import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
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

  create(createDiaryDto: CreateDiaryDto, userId: number): Promise<Diary> {
    const diary = this.diaryRepository.create({
      ...createDiaryDto,
      creatorId: userId,
    });
    return this.diaryRepository.save(diary);
  }

  /** Lista os registros do usuário; filtra por type quando informado. */
  async findAll(
    userId: number,
    type?: DiaryType,
  ): Promise<DiaryListResponseDto> {
    const [rows, count] = await this.diaryRepository.findAndCount({
      where: { creatorId: userId, ...(type ? { type } : {}) },
      order: { day: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number, userId: number): Promise<Diary> {
    const diary = await this.diaryRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!diary) {
      throw new NotFoundException(tr('diary.notFound', { id }));
    }
    return diary;
  }

  async update(
    id: number,
    updateDiaryDto: UpdateDiaryDto,
    userId: number,
  ): Promise<Diary> {
    // Escopo por dono: só edita se o registro for do usuário.
    const diary = await this.findOne(id, userId);
    Object.assign(diary, updateDiaryDto);
    return this.diaryRepository.save(diary);
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.diaryRepository.delete({
      id,
      creatorId: userId,
    });
    if (!result.affected) {
      throw new NotFoundException(tr('diary.notFound', { id }));
    }
  }
}
