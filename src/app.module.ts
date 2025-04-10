import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://spdh427:wOw9EZoA4Ye47t8m@cluster0.wiyn3lh.mongodb.net/crs'),
    // MongooseModule.forRoot('mongodb://localhost:27017/crs'),
    UsersModule,
    AdminsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
