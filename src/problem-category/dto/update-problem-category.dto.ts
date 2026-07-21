import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemCategoryDto } from './create-problem-category.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateProblemCategoryDto extends PartialType(
  CreateProblemCategoryDto,
) {}
