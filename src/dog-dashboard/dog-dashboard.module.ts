import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWalk } from '../dog-walk/entities/dog-walk.entity';
import { DogWeight } from '../dog-weight/entities/dog-weight.entity';
import { DogDashboardController } from './dog-dashboard.controller';
import { DogDashboardService } from './dog-dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dog, DogWalk, DogWeight])],
  providers: [DogDashboardService],
  controllers: [DogDashboardController],
})
export class DogDashboardModule {}
