import { PartialType } from '@nestjs/mapped-types';
import { CreateDiaryDto } from './create-diary.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateDiaryDto extends PartialType(CreateDiaryDto) {}
