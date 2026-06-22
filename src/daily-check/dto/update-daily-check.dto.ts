import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyCheckDto } from './create-daily-check.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateDailyCheckDto extends PartialType(CreateDailyCheckDto) {}
