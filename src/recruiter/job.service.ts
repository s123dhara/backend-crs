import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyProfile } from './entity/company-profile.entity';
import { JobEntity } from './entity/Job.entity';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { formatDistanceToNow } from 'date-fns';
import { Application, ApplicationDocument } from '../application/schemas/application.schema';


@Injectable()
export class JobService {

    constructor(
        @InjectModel(Application.name) private applicationTrackingModel: Model<ApplicationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectRepository(CompanyProfile)
        private companyProfileRepository: Repository<CompanyProfile>,
        @InjectRepository(JobEntity)
        private jobRepository: Repository<JobEntity>
    ) { }

    async create(formData: any, user: any): Promise<any> {

        try {
            const existingUser = await this.userModel.findOne({ email: user.email });
            const user_id = (existingUser?._id as any).toString();

            const profile = await this.companyProfileRepository.findOne({
                where: { user_id: user_id }
            })
            let company_id = profile?.company_id;


            formData.company_id = company_id;


            const job = this.jobRepository.create(formData);
            const savedJob = await this.jobRepository.save(job);

            return {
                status: true,
                statusCode: HttpStatus.ACCEPTED,
                message: "Job Created Succussfully"
            }
        } catch (error) {
            console.error('Error saving Job:', error);
            return {
                status: false,
                statusCode: HttpStatus.BAD_GATEWAY,
                message: "Internal Server Error"
            }
        }

    }

    async findAllJobsByCompany(user: any): Promise<any> {        
        try {           
            const existingUser = await this.userModel.findOne({ email: user.email });
            const user_id = (existingUser?._id as any).toString();

            const profile = await this.companyProfileRepository.findOne({
                where: { user_id },
            });

            if (!profile) {
                return {
                    status: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Company profile not found',
                };
            }

            const company_id = profile.company_id;

            const jobs = await this.jobRepository.find({
                where: { company_id },
                relations: ['company'],
                order: { publish_date: 'DESC' },
            });

            const result = jobs.map((job) => ({
                job_id: job.job_id,
                title: job.title,
                company: {
                    name: profile.name || '',
                    logo: "https://via.placeholder.com/40"
                },
                location: job.location,
                job_type: job.job_type,
                experience_level: job.experience_level,
                is_remote: job.is_remote,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                salary_currency: job.salary_currency,
                is_salary_visible: job.is_salary_visible,
                publish_date: job.publish_date,
                status: job.status,
                applications: job.applications_count,
            }));

            return {
                status: true,
                statusCode: HttpStatus.OK,
                jobs: result,
            };
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return {
                status: false,
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Internal Server Error',
            };
        }
    }


    async getApplicationsCountByJobId(job_id: any): Promise<Number> {

        try {
            const applicationCount = await this.applicationTrackingModel.countDocuments({ _id: job_id });
            return applicationCount;
        } catch (error) {
            console.log(error.message);
            return 0;
        }
    }

    async findOne(job_id: any): Promise<any> {
        try {
            const job = await this.jobRepository.findOne({
                where: {
                    job_id: job_id
                }
            })

            if (!job) {
                return {
                    status: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Job not found',
                }
            }

            return {
                status: true,
                statusCode: HttpStatus.OK,
                job: job
            }

        } catch (error) {
            console.error('Error jobs:', error);
            return {
                status: false,
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Internal Server Error',
            };
        }
    }
    async update(job_id: string, data: any): Promise<any> {
        try {
            const job = await this.jobRepository.findOne({
                where: { job_id }
            });

            if (!job) {
                return {
                    status: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Job not found',
                };
            }

            // Merge new data into the existing job
            const updatedJob = this.jobRepository.merge(job, data);

            // Save to DB
            await this.jobRepository.save(updatedJob);

            return {
                status: true,
                statusCode: HttpStatus.OK,
                message: 'Job updated successfully',
                job: updatedJob,
            };

        } catch (error) {
            console.error('Error updating job:', error);
            return {
                status: false,
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Internal Server Error',
            };
        }
    }




    async delete(job_id: string): Promise<any> {
        try {
            const job = await this.jobRepository.findOne({ where: { job_id } });

            if (!job) {
                return {
                    status: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Job not found',
                };
            }

            await this.jobRepository.remove(job);

            return {
                status: true,
                statusCode: HttpStatus.OK,
                message: 'Job deleted successfully',
            };
        } catch (error) {
            console.error('Error deleting job:', error);
            return {
                status: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error',
            };
        }
    }

    async findAll(): Promise<any> {
        try {
            const allJobs = await this.jobRepository.find({
                relations: ['company'],
            });
            const transformedAllJobs = this.transformJobResponse(allJobs);
            return {
                status: true,
                statusCode: HttpStatus.OK,
                message: 'Job fetch successfully',
                jobs: transformedAllJobs
            };

        } catch (error) {
            console.error('Error all jobs:', error);
            return {
                status: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error',
            };
        }
    }


    transformJobResponse(jobs: any[]): any[] {
        return jobs.map((job, index) => ({
            id: job.job_id,
            title: job.title,
            company: job.company?.name || 'Unknown Company',
            location: job.is_remote ? 'Remote' : job.location || 'Not specified',
            type: job.job_type || 'Full-time',
            posted: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
            salary: job.is_salary_visible
                ? `$${job.salary_min || 0} - $${job.salary_max || 0}`
                : 'Confidential',
            logo: job.company?.name?.[0]?.toUpperCase() || '?',
            experience: job.experience_level || 'Not specified',
            skills: ['JavaScript', 'TypeScript', 'NestJS'], // Hardcoded
        }));
    }

}
