import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { JobProvider } from '../enums/job-provider.enum';
import { JobSearchPeriod } from '../enums/job-search-period.enum';

export class SearchJobsDto {
  // Quais provedores usar. Default: todos (Adzuna + JSearch).
  // Aceita ?providers=adzuna,jsearch ou ?providers=adzuna&providers=jsearch.
  @ApiPropertyOptional({
    enum: JobProvider,
    isArray: true,
    description: 'Provedores a usar (default: todos)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsEnum(JobProvider, { each: true })
  providers?: JobProvider[];

  // Período de tempo. Default (aplicado no service): 3 dias.
  @ApiPropertyOptional({
    enum: JobSearchPeriod,
    default: JobSearchPeriod.THREE_DAYS,
  })
  @IsOptional()
  @IsEnum(JobSearchPeriod)
  period?: JobSearchPeriod;

  // País (FK para a tabela country). Default (no service): Brasil.
  @ApiPropertyOptional({
    example: 1,
    description: 'Id do país (default: Brasil)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  countryId?: number;
}
