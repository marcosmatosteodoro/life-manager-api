import { PartialType } from '@nestjs/mapped-types';
import { CreateApplyDto } from './create-apply.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateApplyDto extends PartialType(CreateApplyDto) {}
