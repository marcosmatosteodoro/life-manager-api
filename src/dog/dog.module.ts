import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogController } from './dog.controller';
import { DogService } from './dog.service';
import { Dog } from './entities/dog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dog])],
  providers: [DogService],
  controllers: [DogController],
  exports: [TypeOrmModule],
})
export class DogModule {}
