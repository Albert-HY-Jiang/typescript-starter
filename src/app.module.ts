import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    EventModule, 
    UserModule, 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'newuser',
      password: '123456789zzZ!',
      database: 'event_planner',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true, 
      synchronize: true,      // Set to false in production
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
