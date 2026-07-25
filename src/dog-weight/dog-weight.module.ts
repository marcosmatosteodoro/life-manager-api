import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWeightController } from './dog-weight.controller';
import { DogWeightService } from './dog-weight.service';
import { DogWeight } from './entities/dog-weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DogWeight, Dog])],
  providers: [DogWeightService],
  controllers: [DogWeightController],
  exports: [TypeOrmModule],
})
export class DogWeightModule {}
