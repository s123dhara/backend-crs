import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AdminEmailService } from './strategies/admin.email.service';


@Injectable()
export class EmailService {
    constructor(private adminMailService: AdminEmailService) { }

    async adminEmailVerificationOtp(to: string, username: string, otp : string) {
        await this.adminMailService.sendEmailVerificationOTP(to, username, otp);

        console.log('email sent successfully')
    }

}
