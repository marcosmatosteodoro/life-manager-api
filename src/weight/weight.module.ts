import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightService } from './weight.service';
import { WeightController } from './weight.controller';
import { Weight } from './entities/weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Weight])],
  providers: [WeightService],
  controllers: [WeightController],
})
export class WeightModule {}
