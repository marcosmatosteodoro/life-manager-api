import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWalkLocation } from '../dog-walk-location/entities/dog-walk-location.entity';
import { DogWalkController } from './dog-walk.controller';
import { DogWalkService } from './dog-walk.service';
import { DogWalk } from './entities/dog-walk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DogWalk, Dog, DogWalkLocation])],
  providers: [DogWalkService],
  controllers: [DogWalkController],
  exports: [TypeOrmModule],
})
export class DogWalkModule {}
