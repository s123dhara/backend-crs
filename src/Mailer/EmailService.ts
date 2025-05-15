import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AdminEmailService } from './strategies/admin.email.service';
import { UserMailService } from './strategies/user.email.service';
import { RecruiterMailService } from './strategies/recruiter.email.service';


@Injectable()
export class EmailService {
    constructor(private adminMailService: AdminEmailService, private userEmailService: UserMailService, private recruiterEmailService: RecruiterMailService) { }

    async adminEmailVerificationOtp(to: string, username: string, otp: string) {
        const result = await this.adminMailService.sendEmailVerificationOTP(to, username, otp);
        return result;
    }

    async userForgetEmailVerification(to: string) {
        to = "spdh427@gmail.com";
        const result = await this.userEmailService.sendUserForgetEmailVerification(to);
        return result;
    }

    async sendBulkEmails(uniqueEmails: string[], subject: string, company: string): Promise<{ success: any[]; failed: any[] }> {
        const success: { email: string; result: boolean } [] = [];
        const failed: { email: string; error: string }[] = [];
        for (const email of uniqueEmails) {
            try {
                const result = await this.recruiterEmailService.sendBulkEmails(email, subject, company);
                success.push({ email, result });
            } catch (error) {
                failed.push({
                    email,
                    error: error.message || 'Failed to send email'
                });
            }
        }

        return { success, failed };
    }


}
