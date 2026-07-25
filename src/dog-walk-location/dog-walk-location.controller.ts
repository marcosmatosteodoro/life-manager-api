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
import { CreateDogWalkLocationDto } from './dto/create-dog-walk-location.dto';
import { DogWalkLocationListResponseDto } from './dto/dog-walk-location-list-response.dto';
import { UpdateDogWalkLocationDto } from './dto/update-dog-walk-location.dto';
import { DogWalkLocation } from './entities/dog-walk-location.entity';
import { DogWalkLocationService } from './dog-walk-location.service';

@ApiTags('dog-walk-location')
@Controller('dog-walk-location')
export class DogWalkLocationController {
  constructor(private readonly service: DogWalkLocationService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um local de passeio' })
  @ApiOkResponse({ type: DogWalkLocation })
  create(@Body() dto: CreateDogWalkLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os locais de passeio' })
  @ApiOkResponse({ type: DogWalkLocationListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um local por id' })
  @ApiOkResponse({ type: DogWalkLocation })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um local' })
  @ApiOkResponse({ type: DogWalkLocation })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDogWalkLocationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um local' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
