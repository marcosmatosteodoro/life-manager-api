import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogWalkLocationController } from './dog-walk-location.controller';
import { DogWalkLocationService } from './dog-walk-location.service';
import { DogWalkLocation } from './entities/dog-walk-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DogWalkLocation])],
  providers: [DogWalkLocationService],
  controllers: [DogWalkLocationController],
  exports: [TypeOrmModule],
})
export class DogWalkLocationModule {}
