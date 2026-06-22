import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DailyCheckService } from './daily-check.service';
import { CreateDailyCheckDto } from './dto/create-daily-check.dto';
import { DailyCheckListResponseDto } from './dto/daily-check-list-response.dto';
import { UpdateDailyCheckDto } from './dto/update-daily-check.dto';
import { DailyCheck } from './entities/daily-check.entity';

@ApiTags('daily-check')
@Controller('daily-check')
export class DailyCheckController {
  constructor(private readonly dailyCheckService: DailyCheckService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um check diário' })
  @ApiOkResponse({ type: DailyCheck })
  create(@Body() createDailyCheckDto: CreateDailyCheckDto) {
    return this.dailyCheckService.create(createDailyCheckDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os checks diários' })
  @ApiOkResponse({ type: DailyCheckListResponseDto })
  findAll() {
    return this.dailyCheckService.findAll();
  }

  // Precisa vir antes de ':id' para não colidir com o ParseIntPipe.
  @Get('today')
  @ApiOperation({
    summary: 'Retorna o check de hoje; cria um automaticamente se não existir',
  })
  @ApiOkResponse({ type: DailyCheck })
  today() {
    return this.dailyCheckService.today();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um check diário por id' })
  @ApiOkResponse({ type: DailyCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dailyCheckService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um check diário' })
  @ApiOkResponse({ type: DailyCheck })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDailyCheckDto: UpdateDailyCheckDto,
  ) {
    return this.dailyCheckService.update(id, updateDailyCheckDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um check diário' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dailyCheckService.remove(id);
  }
}
