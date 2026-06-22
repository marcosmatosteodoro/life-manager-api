import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
