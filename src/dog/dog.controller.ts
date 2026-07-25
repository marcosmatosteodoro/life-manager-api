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
import { CreateDogDto } from './dto/create-dog.dto';
import { DogListResponseDto } from './dto/dog-list-response.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { Dog } from './entities/dog.entity';
import { DogService } from './dog.service';

@ApiTags('dog')
@Controller('dog')
export class DogController {
  constructor(private readonly service: DogService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um cão' })
  @ApiOkResponse({ type: Dog })
  create(@Body() dto: CreateDogDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os cães' })
  @ApiOkResponse({ type: DogListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cão por id' })
  @ApiOkResponse({ type: Dog })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um cão' })
  @ApiOkResponse({ type: Dog })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDogDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um cão' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
