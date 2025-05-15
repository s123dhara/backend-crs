import { Module } from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { RecruiterController } from './recruiter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyProfile } from './entity/company-profile.entity';
import { JobEntity } from './entity/Job.entity';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JobService } from './job.service';
import { Application, ApplicationSchema } from '../application/schemas/application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    TypeOrmModule.forFeature([CompanyProfile, JobEntity]),
  ],
  controllers: [RecruiterController],
  providers: [RecruiterService, JobService],
})
export class RecruiterModule { }
