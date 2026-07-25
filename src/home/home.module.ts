import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apply } from '../apply/entities/apply.entity';
import { Article } from '../article/entities/article.entity';
import { Dog } from '../dog/entities/dog.entity';
import { DogWeight } from '../dog-weight/entities/dog-weight.entity';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { TodoModule } from '../todo/todo.module';
import { Weight } from '../weight/entities/weight.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [
    // TodoModule exporta o TodoCheckService (lógica de "checks de hoje").
    TodoModule,
    TypeOrmModule.forFeature([
      Article,
      Weight,
      FlashCard,
      FlashCardGroup,
      Apply,
      Dog,
      DogWeight,
    ]),
  ],
  providers: [HomeService],
  controllers: [HomeController],
})
export class HomeModule {}
