import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../country/entities/country.entity';
import { CompanyListResponseDto } from './dto/company-list-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    await this.ensureCountryExists(createCompanyDto.countryId);
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<CompanyListResponseDto> {
    // Carrega a relação country; findAndCount retorna [registros, total].
    const [rows, count] = await this.companyRepository.findAndCount({
      relations: { country: true },
      order: { name: 'ASC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: { country: true },
    });
    if (!company) {
      throw new NotFoundException(`Company #${id} não encontrado`);
    }
    return company;
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    // Valida a FK apenas quando countryId é enviado.
    if (updateCompanyDto.countryId !== undefined) {
      await this.ensureCountryExists(updateCompanyDto.countryId);
    }
    // preload garante 404 quando o id não existe, sem update silencioso.
    const company = await this.companyRepository.preload({
      id,
      ...updateCompanyDto,
    });
    if (!company) {
      throw new NotFoundException(`Company #${id} não encontrado`);
    }
    return this.companyRepository.save(company);
  }

  async remove(id: number): Promise<void> {
    const result = await this.companyRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Company #${id} não encontrado`);
    }
  }

  /** Garante que o país referenciado existe (erro limpo em vez de violação de FK). */
  private async ensureCountryExists(countryId: number): Promise<void> {
    const country = await this.countryRepository.findOne({
      where: { id: countryId },
    });
    if (!country) {
      throw new NotFoundException(`Country #${countryId} não encontrado`);
    }
  }
}
