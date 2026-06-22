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
import { ApplyService } from './apply.service';
import { ApplyListResponseDto } from './dto/apply-list-response.dto';
import { CreateApplyDto } from './dto/create-apply.dto';
import { UpdateApplyDto } from './dto/update-apply.dto';
import { Apply } from './entities/apply.entity';

@ApiTags('apply')
@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma candidatura' })
  @ApiOkResponse({ type: Apply })
  create(@Body() createApplyDto: CreateApplyDto) {
    return this.applyService.create(createApplyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as candidaturas' })
  @ApiOkResponse({ type: ApplyListResponseDto })
  findAll() {
    return this.applyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma candidatura por id' })
  @ApiOkResponse({ type: Apply })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente uma candidatura' })
  @ApiOkResponse({ type: Apply })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplyDto: UpdateApplyDto,
  ) {
    return this.applyService.update(id, updateApplyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma candidatura' })
  @ApiNoContentResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.applyService.remove(id);
  }
}
