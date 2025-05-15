import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

import { Application, ApplicationDocument } from './schemas/application.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicantProfile, DocumentProfile, EducationProfile } from '../users/entity';
import { JobEntity } from '../recruiter/entity/Job.entity';
import axios from 'axios';



@Injectable()
export class ApplicationService {

  constructor(
    @InjectModel(Application.name) private applicatoinTrackingModel: Model<ApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectRepository(ApplicantProfile) private applicantProfileRepo: Repository<ApplicantProfile>,
    @InjectRepository(DocumentProfile) private documentProfileRepo: Repository<DocumentProfile>,
    @InjectRepository(EducationProfile) private educationProfileRepo: Repository<EducationProfile>,
    @InjectRepository(JobEntity) private jobRepo: Repository<JobEntity>
  ) { }

  async create(jobDetails: any, user: any): Promise<any> {
    try {
      const existingUser = await this.userModel.findOne({ email: user.email });
      const user_id = (existingUser?._id as any).toString();

      const applicantProfile = await this.applicantProfileRepo.findOne({
        where: {
          user_id,
        },
        select: ['profile_id'],
      });

      const applicant_id = applicantProfile?.profile_id;

      if (!applicant_id) {
        return {
          status: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Applicant profile not found',
        };
      }

      // 🔍 Check if user already applied
      const alreadyApplied = await this.applicatoinTrackingModel.findOne({
        applicant_id,
        job_id: jobDetails?.id,
      });

      if (alreadyApplied) {
        return {
          status: false,
          statusCode: HttpStatus.CONFLICT,
          message: 'You have already applied for this job',
        };
      }

      // ✅ Save new application
      // Create a new application document
      const createNewApplication = new this.applicatoinTrackingModel({
        applicant_id,
        job_id: jobDetails?.id,
        application_status: 'APPLIED',
      });

      // Save the new application
      const savedApplication = await createNewApplication.save();

      // Find the corresponding job record
      const existingJobRecord = await this.jobRepo.findOne({
        where: {
          job_id: jobDetails?.id,
        },
        select: ['job_id', 'applications_count'], // You may need 'id' to update
      });

      // If job record exists, increment and save
      if (existingJobRecord) {
        existingJobRecord.applications_count += 1;
        await this.jobRepo.save(existingJobRecord);
      }


      // const savedApplication = await createNewApplication.save();

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Application added successfully',
        status: true,
        application: savedApplication,
      };
    } catch (error) {
      console.error('Application Create Error:', error);
      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      };
    }
  }

  /*{
      application_id: '1',
      job_id: '101',
      job_title: 'Frontend Developer',
      profile_id: 'p1',
      candidate_name: 'Alex Johnson',
      candidate_image: 'https://randomuser.me/api/portraits/men/32.jpg',
      current_title: 'UI Developer at TechCorp',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
      applied_at: '2023-05-15T10:30:00Z',
      status: 'review',
      match_score: 85,
      education: 'BS Computer Science, Stanford University',
      experience: '5 years'
      },

    */


  /*
  {
  job_description: "We are looking for a passionate and motivated Backend Developer (Fresher) to join our team. This role is ideal for recent graduates or individuals starting their career in web development. You will work closely with our engineering team to build and maintain server-side logic, databases, and APIs for our web applications",
  required_skills: ["postgresql", "html", "css", "js", "nodejs", "express", "mongodb", "reactjs", "php", "javascript", "python"],
  minimum_experience: 0,
  required_educations: ["computer science", "bsc", "mca"],
  candidate_details: [
    {
      id: "candidate_1",
      name: "John Doe",
      file_path: "D:\\Proc\\ats\\resume_1.pdf"
    },
    {
      id: "candidate_2",
      name: "Jane Smith",
      file_path: "D:\\Proc\\ats\\resume_2.pdf"
    }
  ]
};
  */
  async findApplicationsByJobId(job_id: any): Promise<any> {
    try {
      // console.log(job_id);
      const job = await this.jobRepo.findOne({
        where: {
          job_id
        }
      })

      // Step 1: Fetch applicantRecords (MongoDB / Mongoose syntax assumed)
      const applicantRecords = await this.applicatoinTrackingModel.find(
        { job_id: job_id },
        { applicant_id: 1, _id: 0, application_status: 1, createdAt: 1 }
      );

      // Step 2: Extract applicant_ids
      const applicant_ids = applicantRecords.map(record => record.applicant_id);

      // Step 3: Fetch documents from PostgreSQL (TypeORM)
      const documents = await this.documentProfileRepo.find({
        where: {
          profile: In(applicant_ids),
        },
        select: ['document_id', 'file_path', 'profile'],
        relations: ['profile']
      });

      const educations = await this.educationProfileRepo.find({
        where: {
          profile: In(applicant_ids)
        },
        select: ['degree', 'field_of_study', 'institution'],
        relations: ['profile']
      })

      // console.log(educations);
      // const applicant_ids = applicantRecords.map(record => record.applicant_id);

      let result: { id: string; name: string; file_path: string }[] = [];

      for (const doc of documents) {
        result.push({
          id: doc.profile.profile_id,
          name: doc.profile.first_name + " " + doc.profile.last_name,
          file_path: doc.file_path,
        });
      }

      // console.log(result);

      let objMapJob = {
        job_description: job?.description,
        required_skills: ["html", "css", "js", "nodejs", "express"],
        minimum_experience: 0,
        required_educations: ['bachelor'],
        candidate_details: result
      }

      // console.log(objMapJob);

      try {
        const response = await axios.post('http://localhost:5001/evaluate-candidates', objMapJob);
        console.log(response.data);
        var data = response.data;
      } catch (error) {
        console.error('Error sending POST request:', error.message);

      }

      const finalResult: any[] = [];

      for (let i = 0; i < applicantRecords.length; i++) {
        const doc = documents[i];
        const education = educations[i];
        const score = data.results[i];

        finalResult.push({
          applicant_id: applicantRecords[i].applicant_id,
          job_id: job_id,
          job_title: job?.title ?? '',
          profile_id: applicantRecords[i].applicant_id,
          candidate_name: `${doc?.profile?.first_name ?? ''} ${doc?.profile?.last_name ?? ''}`,
          candidate_image: "https://randomuser.me/api/portraits/men/32.jpg",
          current_title: 'UI Developer at TechCorp',
          skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
          applied_at: applicantRecords[i]?.createdAt,
          status: applicantRecords[i]?.application_status ?? 'APPLIED',
          match_score: score?.scores?.total_score ?? 0,
          education: `${education?.degree ?? ''} in ${education?.field_of_study ?? ''} from ${education?.institution ?? ''}`,
          experience: `0 year`,
        });
      }



      return {
        status: true,
        statusCode: HttpStatus.ACCEPTED,
        message: "Request Allowed",       
        applicants: finalResult,
        jobname : job?.title
      }

    } catch (error) {
      console.log(error.message)
    }
  }

  findAll() {
    return `This action returns all application`;
  }

  findOne(id: number) {
    return `This action returns a #${id} application`;
  }

  update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
