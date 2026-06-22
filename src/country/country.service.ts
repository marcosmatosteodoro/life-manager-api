import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryListResponseDto } from './dto/country-list-response.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  create(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepository.create(createCountryDto);
    return this.countryRepository.save(country);
  }

  async findAll(): Promise<CountryListResponseDto> {
    // findAndCount retorna [registros, total] numa única consulta.
    const [rows, count] = await this.countryRepository.findAndCount({
      order: { name: 'ASC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country) {
      throw new NotFoundException(`Country #${id} não encontrado`);
    }
    return country;
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const country = await this.countryRepository.preload({
      id,
      ...updateCountryDto,
    });
    if (!country) {
      throw new NotFoundException(`Country #${id} não encontrado`);
    }
    return this.countryRepository.save(country);
  }

  async remove(id: number): Promise<void> {
    const result = await this.countryRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Country #${id} não encontrado`);
    }
  }
}
