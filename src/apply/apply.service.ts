import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { tr } from '../i18n/translate';
import { ApplyListResponseDto } from './dto/apply-list-response.dto';
import { CreateApplyDto } from './dto/create-apply.dto';
import { UpdateApplyDto } from './dto/update-apply.dto';
import { Apply } from './entities/apply.entity';

@Injectable()
export class ApplyService {
  constructor(
    @InjectRepository(Apply)
    private readonly applyRepository: Repository<Apply>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createApplyDto: CreateApplyDto): Promise<Apply> {
    await this.ensureCompanyExists(createApplyDto.companyId);
    const apply = this.applyRepository.create(createApplyDto);
    return this.applyRepository.save(apply);
  }

  async findAll(): Promise<ApplyListResponseDto> {
    // Carrega a relação company; findAndCount retorna [registros, total].
    const [rows, count] = await this.applyRepository.findAndCount({
      relations: { company: true },
      order: { date: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Apply> {
    const apply = await this.applyRepository.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!apply) {
      throw new NotFoundException(tr('apply.notFound', { id }));
    }
    return apply;
  }

  async update(id: number, updateApplyDto: UpdateApplyDto): Promise<Apply> {
    // Valida a FK apenas quando companyId é enviado.
    if (updateApplyDto.companyId !== undefined) {
      await this.ensureCompanyExists(updateApplyDto.companyId);
    }
    // preload garante 404 quando o id não existe, sem update silencioso.
    const apply = await this.applyRepository.preload({
      id,
      ...updateApplyDto,
    });
    if (!apply) {
      throw new NotFoundException(tr('apply.notFound', { id }));
    }
    return this.applyRepository.save(apply);
  }

  async remove(id: number): Promise<void> {
    const result = await this.applyRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('apply.notFound', { id }));
    }
  }

  /** Garante que a empresa referenciada existe (erro limpo em vez de violação de FK). */
  private async ensureCompanyExists(companyId: number): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(
        tr('apply.companyNotFound', { id: companyId }),
      );
    }
  }
}
