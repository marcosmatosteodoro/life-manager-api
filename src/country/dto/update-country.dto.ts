import { PartialType } from '@nestjs/mapped-types';
import { CreateCountryDto } from './create-country.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
