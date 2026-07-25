import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
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
import { CurrentUser } from '../auth/current-user.decorator';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { DiaryListResponseDto } from './dto/diary-list-response.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Diary } from './entities/diary.entity';
import { DiaryType } from './enums/diary-type.enum';

@ApiTags('diary')
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um registro de diário' })
  @ApiOkResponse({ type: Diary })
  create(
    @Body() createDiaryDto: CreateDiaryDto,
    @CurrentUser() userId: number,
  ) {
    return this.diaryService.create(createDiaryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os registros (filtro opcional por type)' })
  @ApiQuery({ name: 'type', enum: DiaryType, required: false })
  @ApiOkResponse({ type: DiaryListResponseDto })
  findAll(
    @CurrentUser() userId: number,
    @Query('type', new ParseEnumPipe(DiaryType, { optional: true }))
    type?: DiaryType,
  ) {
    return this.diaryService.findAll(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um registro por id' })
  @ApiOkResponse({ type: Diary })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.diaryService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um registro' })
  @ApiOkResponse({ type: Diary })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
    @CurrentUser() userId: number,
  ) {
    return this.diaryService.update(id, updateDiaryDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um registro' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.diaryService.remove(id, userId);
  }
}
