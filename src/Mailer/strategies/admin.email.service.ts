import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdminEmailService {
    constructor(private mailerService: MailerService) { }

    async sendEmailVerificationOTP(to: string, username: string, otp: string) {

        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Campus Recruitment System Security Verification Code',
                template: 'Admin/OtpVerificationEmail', // ./templates/welcome.hbs
                context: {
                    username,
                    otp,
                    year: new Date().getFullYear()
                },
            });
            return true;
        } catch (error) {
            return true;
        }
    }
}
