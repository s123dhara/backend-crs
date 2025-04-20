import { Module } from '@nestjs/common';
import { EmailService } from './EmailService';
import { AdminEmailService } from './strategies/admin.email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UserMailService } from './strategies/user.email.service';
import { RecruiterMailService } from './strategies/recruiter.email.service';


@Module({
    imports: [MailerModule.forRoot({
        transport: {
            host: 'smtp.gmail.com', // or your SMTP provider
            port: 587,
            secure: false,
            auth: {
                user: 'darkcodm123@gmail.com',
                pass: 'qpti jcsh gxyn phyw', // use App Password if using Gmail
            },
        },
        defaults: {
            from: '"No Reply" <no-reply-crs@gmail.com>',
        },
        template: {
            dir: __dirname + '\\templates',
            // dir: path.join(__dirname, 'Mailer', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
                strict: true,
            },
        },
    }),],
    controllers: [],
    providers: [EmailService, AdminEmailService, UserMailService, RecruiterMailService],
    exports: [EmailService],
})

export class EmailModule { }