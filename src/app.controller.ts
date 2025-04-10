import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() req: Request, @Res({ passthrough: true }) res: Response): any {
    // res.cookie('access_token', 'asdfasdf', {
    //   httpOnly: true,
    //   secure: false, // true in production with HTTPS
    //   sameSite: 'lax',
    //   maxAge: 1000 * 60 * 1, // 15 minutes
    // });

    const accessToken = req.cookies['access_token'];;
    return "hello world " + accessToken;
  }
}
