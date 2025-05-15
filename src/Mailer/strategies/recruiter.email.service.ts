import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RecruiterMailService {
    constructor(private mailerService: MailerService) { }

    async sendBulkEmails(to: string, subject : string, company : string) {
        try {
            await this.mailerService.sendMail({
                to,
                subject: subject,
                template: 'Recruiter/bulkMailTemplate_01', // ./templates/welcome.hbs
                context: {
                    email : to,    
                    company : company,
                    year: new Date().getFullYear()
                },
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}