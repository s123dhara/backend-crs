import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { EmailService } from '../Mailer/EmailService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantProfile, DocumentProfile, EducationProfile, ExperienceProfile, SkillProfile } from './entity';
import { EmailModule } from '../Mailer/Email.module';




@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([ApplicantProfile, EducationProfile, ExperienceProfile, SkillProfile, DocumentProfile]),
    EmailModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
