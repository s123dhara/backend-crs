import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RecruiterMailService {
    constructor(private mailer: MailerService) { }
}