import { PartialType } from '@nestjs/mapped-types';
import { CreateDogWeightDto } from './create-dog-weight.dto';

export class UpdateDogWeightDto extends PartialType(CreateDogWeightDto) {}
