import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../event/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
