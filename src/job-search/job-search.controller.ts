import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JobSearchResponseDto } from './dto/job-search-response.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobSearchService } from './job-search.service';

@ApiTags('job-search')
@Controller('job-search')
export class JobSearchController {
  constructor(private readonly service: JobSearchService) {}

  @Get()
  @ApiOperation({
    summary:
      'Busca vagas remotas (Adzuna e/ou JSearch) por país, ranqueadas pela stack',
  })
  @ApiOkResponse({ type: JobSearchResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Nenhum provedor configurado' })
  search(@Query() dto: SearchJobsDto) {
    return this.service.search(dto);
  }
}
