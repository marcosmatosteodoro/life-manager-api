import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { HomeService } from './home.service';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly service: HomeService) {}

  @Get()
  @ApiOperation({ summary: 'Dados agregados da Home (uma única requisição)' })
  @ApiOkResponse({ type: DashboardResponseDto })
  getDashboard(@CurrentUser() userId: number) {
    return this.service.getDashboard(userId);
  }
}
