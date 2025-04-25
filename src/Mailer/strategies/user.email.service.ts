import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserMailService {
    constructor(private mailerService: MailerService) { }

    async sendUserForgetEmailVerification(to: string) {

        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Campus Recruitment System Security Forgot Password Verfication',
                template: 'User/forgotEmail', // ./templates/welcome.hbs
                context: {
                    RESET_LINK : "JALFJASKLDJFKLASDJFKAJKF13123123",
                    YEAR: new Date().getFullYear()
                },
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}