import { PartialType } from '@nestjs/mapped-types';
import { CreateWeightDto } from './create-weight.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateWeightDto extends PartialType(CreateWeightDto) {}
