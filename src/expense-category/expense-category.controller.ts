import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpenseCategoryListResponseDto } from './dto/expense-category-list-response.dto';
import { ExpenseCategoryService } from './expense-category.service';

@ApiTags('expense-category')
@Controller('expense-category')
export class ExpenseCategoryController {
  constructor(private readonly service: ExpenseCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as categorias de gasto' })
  @ApiOkResponse({ type: ExpenseCategoryListResponseDto })
  findAll() {
    return this.service.findAll();
  }
}
