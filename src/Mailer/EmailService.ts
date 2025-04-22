import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AdminEmailService } from './strategies/admin.email.service';
import { UserMailService } from './strategies/user.email.service';


@Injectable()
export class EmailService {
    constructor(private adminMailService: AdminEmailService, private userEmailService : UserMailService) { }

    async adminEmailVerificationOtp(to: string, username: string, otp: string) {
        const result = await this.adminMailService.sendEmailVerificationOTP(to, username, otp);
        return result;
    }

    async userForgetEmailVerification(to : string) {
        to = "spdh427@gmail.com";
        const result = await this.userEmailService.sendUserForgetEmailVerification(to);
        return result;
    }

}
