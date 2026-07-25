import { PartialType } from '@nestjs/mapped-types';
import { CreateDogWalkDto } from './create-dog-walk.dto';

export class UpdateDogWalkDto extends PartialType(CreateDogWalkDto) {}
