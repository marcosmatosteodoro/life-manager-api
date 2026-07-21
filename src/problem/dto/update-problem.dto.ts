import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemDto } from './create-problem.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateProblemDto extends PartialType(CreateProblemDto) {}
