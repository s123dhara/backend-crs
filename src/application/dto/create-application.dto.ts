// dto/create-application.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    job_id: string;

    @IsString()
    applicant_id: string;

    @IsEnum(['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'ASSESSMENT', 'OFFERED', 'HIRED', 'REJECTED'])
    @IsOptional()
    application_status?: string;

    @IsOptional()
    rejection_reason?: string;

    @IsOptional()
    recruiter_notes?: string;
}
