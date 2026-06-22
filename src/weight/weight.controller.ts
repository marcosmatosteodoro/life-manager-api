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
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { Weight } from './entities/weight.entity';
import { WeightService } from './weight.service';

@ApiTags('weight')
@Controller('weight')
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um registro de peso' })
  @ApiOkResponse({ type: Weight })
  create(@Body() createWeightDto: CreateWeightDto) {
    return this.weightService.create(createWeightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os registros de peso' })
  @ApiOkResponse({ type: Weight, isArray: true })
  findAll() {
    return this.weightService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um registro de peso por id' })
  @ApiOkResponse({ type: Weight })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.weightService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um registro de peso' })
  @ApiOkResponse({ type: Weight })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWeightDto: UpdateWeightDto,
  ) {
    return this.weightService.update(id, updateWeightDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um registro de peso' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.weightService.remove(id);
  }
}
