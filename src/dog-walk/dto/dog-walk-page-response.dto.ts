import { ApiProperty } from '@nestjs/swagger';
import { Dog } from '../../dog/entities/dog.entity';
import { DogWalkLocation } from '../../dog-walk-location/entities/dog-walk-location.entity';
import { DogWalk } from '../entities/dog-walk.entity';

/**
 * Payload agregado da página de Passeios (uma requisição em vez de três:
 * passeios + cães + locais). Espelha o padrão da Home.
 */
export class DogWalkPageResponseDto {
  @ApiProperty({ type: DogWalk, isArray: true })
  walks: DogWalk[];

  @ApiProperty({ type: Dog, isArray: true })
  dogs: Dog[];

  @ApiProperty({ type: DogWalkLocation, isArray: true })
  locations: DogWalkLocation[];
}
