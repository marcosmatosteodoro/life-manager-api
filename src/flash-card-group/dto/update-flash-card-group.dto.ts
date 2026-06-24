import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashCardGroupDto } from './create-flash-card-group.dto';

export class UpdateFlashCardGroupDto extends PartialType(
  CreateFlashCardGroupDto,
) {}
