import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoCheckController } from './todo-check.controller';
import { TodoCheckService } from './todo-check.service';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoCheck } from './entities/todo-check.entity';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, TodoCheck])],
  providers: [TodoService, TodoCheckService],
  controllers: [TodoController, TodoCheckController],
  exports: [TodoCheckService], // usado pelo HomeModule (dashboard)
})
export class TodoModule {}
