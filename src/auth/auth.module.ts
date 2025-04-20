import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwoFactorAuthService } from './2fa/twofactor.auth.service';
import { RedisModule } from '../Redis/redis.module';
import { OtpService } from './otp/otp.service';
import { EmailService } from '../Mailer/EmailService';
import { EmailModule } from '../Mailer/Email.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET_KEY'),
      signOptions: { expiresIn: '1d' },
    }),
  }),
    RedisModule,
    EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwoFactorAuthService, OtpService],
})
export class AuthModule { }
