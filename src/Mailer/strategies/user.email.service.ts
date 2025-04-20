import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserMailService {
    constructor(private mailer: MailerService){}
}