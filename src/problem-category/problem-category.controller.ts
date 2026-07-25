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
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProblemCategoryDto } from './dto/create-problem-category.dto';
import { ProblemCategoryListResponseDto } from './dto/problem-category-list-response.dto';
import { UpdateProblemCategoryDto } from './dto/update-problem-category.dto';
import { ProblemCategory } from './entities/problem-category.entity';
import { ProblemCategoryService } from './problem-category.service';

@ApiTags('problem-category')
@Controller('problem-category')
export class ProblemCategoryController {
  constructor(private readonly service: ProblemCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma categoria' })
  @ApiOkResponse({ type: ProblemCategory })
  create(@Body() dto: CreateProblemCategoryDto, @CurrentUser() userId: number) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as categorias de problemas' })
  @ApiOkResponse({ type: ProblemCategoryListResponseDto })
  findAll(@CurrentUser() userId: number) {
    return this.service.findAll(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma categoria' })
  @ApiOkResponse({ type: ProblemCategory })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProblemCategoryDto,
    @CurrentUser() userId: number,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma categoria (desvincula dos problemas)' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.service.remove(id, userId);
  }
}
