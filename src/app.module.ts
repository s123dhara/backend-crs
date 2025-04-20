import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemConfig } from './config/systemConfig';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './Mailer/EmailService';
import { UserMailService } from './Mailer/strategies/user.email.service';
import { AdminEmailService } from './Mailer/strategies/admin.email.service';
import { RecruiterMailService } from './Mailer/strategies/recruiter.email.service';
import { EmailModule } from './Mailer/Email.module';
import { RolesModule } from './roles/roles.module';

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
    UsersModule,
    AdminsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),

    EmailModule,

    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SystemConfig],
})
export class AppModule { }
