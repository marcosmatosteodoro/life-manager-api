import { PartialType } from '@nestjs/mapped-types';
import { CreateDogWalkLocationDto } from './create-dog-walk-location.dto';

export class UpdateDogWalkLocationDto extends PartialType(
  CreateDogWalkLocationDto,
) {}
