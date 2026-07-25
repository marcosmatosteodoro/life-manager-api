import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPhoto } from './entities/user-photo.entity';
import { User } from './entities/user.entity';
import { UserAdminController } from './user-admin.controller';
import { UserController } from './user.controller';
import { UserSeederService } from './user-seeder.service';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPhoto])],
  providers: [UserService, UserSeederService],
  controllers: [UserController, UserAdminController],
  exports: [UserService],
})
export class UserModule {}
