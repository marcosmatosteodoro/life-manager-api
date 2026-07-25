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
  Query,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDogWeightDto } from './dto/create-dog-weight.dto';
import { DogWeightListResponseDto } from './dto/dog-weight-list-response.dto';
import { UpdateDogWeightDto } from './dto/update-dog-weight.dto';
import { DogWeight } from './entities/dog-weight.entity';
import { DogWeightService } from './dog-weight.service';

@ApiTags('dog-weight')
@Controller('dog-weight')
export class DogWeightController {
  constructor(private readonly service: DogWeightService) {}

  @Post()
  @ApiOperation({ summary: 'Registra a pesagem de um cão' })
  @ApiOkResponse({ type: DogWeight })
  @ApiNotFoundResponse({ description: 'Cão (dogId) não encontrado' })
  create(@Body() dto: CreateDogWeightDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as pesagens (opcionalmente por cão)' })
  @ApiQuery({ name: 'dogId', required: false, type: Number })
  @ApiOkResponse({ type: DogWeightListResponseDto })
  findAll(@Query('dogId') dogId?: string) {
    const parsed = dogId ? Number(dogId) : undefined;
    return this.service.findAll(
      parsed && Number.isFinite(parsed) ? parsed : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma pesagem por id' })
  @ApiOkResponse({ type: DogWeight })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma pesagem' })
  @ApiOkResponse({ type: DogWeight })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDogWeightDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma pesagem' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
