import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { JwtGuard } from './auth/guard';
import { EmailService } from './Mailer/EmailService';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private emailService: EmailService) { }

  @UseGuards(JwtGuard)
  @Get('/me')
  getHello(@Req() req: Request, @Res({ passthrough: true }) res: Response): any {
    // res.cookie('access_token', 'asdfasdf', {
    //   httpOnly: true,
    //   secure: false, // true in production with HTTPS
    //   sameSite: 'lax',
    //   maxAge: 1000 * 60 * 1, // 15 minutes
    // });

    const accessToken = req.cookies['refresh_token'];;
    return "hello world " + accessToken;
  }
}
