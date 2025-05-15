import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemConfig } from './config/systemConfig';

import { EmailModule } from './Mailer/Email.module';
import { RolesModule } from './roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresTestUser } from './users/entity/user.entity';
import { ApplicantProfile } from './users/entity';
import { join } from 'path';

import { SignalingGateway } from './signaling/signaling.gateway';
import { RecruiterModule } from './recruiter/recruiter.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const systemConfig = new SystemConfig(configService);
        return {
          uri: systemConfig.mongodbUri
        }
      }
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'crs',
      // entities : [ApplicantProfile],
      entities: [join(__dirname, '**', 'entity', '**', '*.entity.{ts,js}')],
      // autoLoadEntities: true, // Automatically load entities
      synchronize: true,      // Auto-create tables (disable in production)
    }),
    TypeOrmModule.forFeature([postgresTestUser]),

    UsersModule,
    AdminsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),

    EmailModule,

    RolesModule,

    RecruiterModule,

    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService, SystemConfig],
})
export class AppModule { }
