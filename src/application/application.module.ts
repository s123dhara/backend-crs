import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ApplicantProfile, DocumentProfile, EducationProfile } from '../users/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from '../recruiter/entity/Job.entity';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([ApplicantProfile, JobEntity, DocumentProfile, EducationProfile])
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule { }
