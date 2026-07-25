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
  Put,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PhotoResponseDto } from '../common/dto/photo-response.dto';
import { SetPhotoDto } from '../common/dto/set-photo.dto';
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

  // ----- Foto de perfil -----

  @Get(':id/photo')
  @ApiOperation({ summary: 'Busca a foto de perfil do cão (base64)' })
  @ApiOkResponse({ type: PhotoResponseDto })
  @ApiNotFoundResponse({ description: 'Cão sem foto de perfil' })
  getPhoto(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPhoto(id);
  }

  @Put(':id/photo')
  @ApiOperation({ summary: 'Define/atualiza a foto de perfil do cão' })
  @ApiOkResponse({ type: PhotoResponseDto })
  @ApiNotFoundResponse({ description: 'Cão não encontrado' })
  setPhoto(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPhotoDto) {
    return this.service.setPhoto(id, dto);
  }

  @Delete(':id/photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a foto de perfil do cão' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Cão sem foto de perfil' })
  removePhoto(@Param('id', ParseIntPipe) id: number) {
    return this.service.removePhoto(id);
  }
}
