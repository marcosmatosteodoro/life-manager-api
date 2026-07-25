import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DogDashboardResponseDto } from './dto/dog-dashboard-response.dto';
import { DogDashboardService } from './dog-dashboard.service';

@ApiTags('dog-dashboard')
@Controller('dog-dashboard')
export class DogDashboardController {
  constructor(private readonly service: DogDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Estatísticas de passeios e peso dos cães' })
  @ApiOkResponse({ type: DogDashboardResponseDto })
  get() {
    return this.service.getDashboard();
  }
}
