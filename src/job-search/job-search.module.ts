import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from '../country/entities/country.entity';
import { JobSearchController } from './job-search.controller';
import { JobSearchService } from './job-search.service';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JSearchProvider } from './providers/jsearch.provider';

@Module({
  // Country: usado para resolver o país da busca pela FK.
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [JobSearchController],
  providers: [JobSearchService, AdzunaProvider, JSearchProvider],
})
export class JobSearchModule {}
