import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogController } from './dog.controller';
import { DogService } from './dog.service';
import { DogPhoto } from './entities/dog-photo.entity';
import { Dog } from './entities/dog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dog, DogPhoto])],
  providers: [DogService],
  controllers: [DogController],
  exports: [TypeOrmModule],
})
export class DogModule {}
