import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { ApplyService } from './apply.service';
import { ApplyController } from './apply.controller';
import { Apply } from './entities/apply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Apply, Company])],
  providers: [ApplyService],
  controllers: [ApplyController],
})
export class ApplyModule {}
