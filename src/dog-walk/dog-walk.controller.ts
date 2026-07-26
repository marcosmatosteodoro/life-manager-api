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
import { CreateDogWalkDto } from './dto/create-dog-walk.dto';
import { DogWalkListResponseDto } from './dto/dog-walk-list-response.dto';
import { DogWalkPageResponseDto } from './dto/dog-walk-page-response.dto';
import { UpdateDogWalkDto } from './dto/update-dog-walk.dto';
import { DogWalk } from './entities/dog-walk.entity';
import { DogWalkService } from './dog-walk.service';

@ApiTags('dog-walk')
@Controller('dog-walk')
export class DogWalkController {
  constructor(private readonly service: DogWalkService) {}

  @Post()
  @ApiOperation({ summary: 'Registra um passeio finalizado' })
  @ApiOkResponse({ type: DogWalk })
  @ApiNotFoundResponse({ description: 'Local ou algum cão não encontrado' })
  create(@Body() dto: CreateDogWalkDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os passeios (com cães e local)' })
  @ApiOkResponse({ type: DogWalkListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // Declarado ANTES de :id para não colidir com o param.
  @Get('page')
  @ApiOperation({
    summary: 'Dados agregados da página (passeios + cães + locais)',
  })
  @ApiOkResponse({ type: DogWalkPageResponseDto })
  page() {
    return this.service.page();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um passeio por id' })
  @ApiOkResponse({ type: DogWalk })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um passeio' })
  @ApiOkResponse({ type: DogWalk })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDogWalkDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um passeio' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
