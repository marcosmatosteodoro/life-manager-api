import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProblemCategoryListResponseDto } from './dto/problem-category-list-response.dto';
import { ProblemCategoryService } from './problem-category.service';

@ApiTags('problem-category')
@Controller('problem-category')
export class ProblemCategoryController {
  constructor(private readonly service: ProblemCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as categorias de problemas (pré-definidas)' })
  @ApiOkResponse({ type: ProblemCategoryListResponseDto })
  findAll() {
    return this.service.findAll();
  }
}
