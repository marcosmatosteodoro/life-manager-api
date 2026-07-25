import { PartialType } from '@nestjs/mapped-types';
import { CreateDogDto } from './create-dog.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateDogDto extends PartialType(CreateDogDto) {}
