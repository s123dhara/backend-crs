import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { JwtGuard } from './auth/guard';
import { EmailService } from './Mailer/EmailService';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import axios from 'axios';

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

  @Post('/test3')
  async test3(@Req() req: Request, @Res() res: Response) {
    try {
      const { name, email } = req.body;
      console.log("request accepted:", { name, email });

      const savedUser = await this.appService.create2({ name, email });
      return res.status(201).json(savedUser);
      // res.status(201).json({ "HELLO" : "HSDF" });
    } catch (error) {
      console.error('Controller Error:', error.message, error.stack);
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }

  @Get('/demo')
  async demo(@Req() req: Request, @Res() res: Response) {
    const data = {
      job_description: "We are looking for a passionate and motivated Backend Developer (Fresher) to join our team. This role is ideal for recent graduates or individuals starting their career in web development. You will work closely with our engineering team to build and maintain server-side logic, databases, and APIs for our web applications",
      required_skills: ["postgresql", "html", "css", "js", "nodejs", "express", "mongodb", "reactjs", "php", "javascript", "python"],
      minimum_experience: 0,
      required_educations: ["computer science", "bsc", "mca"],
      candidate_details: [
        {
          id: "candidate_1",
          name: "John Doe",
          file_path: "D:\\Proc\\ats\\resume_1.pdf"
        },
        {
          id: "candidate_2",
          name: "Jane Smith",
          file_path: "D:\\Proc\\ats\\resume_2.pdf"
        }
      ]
    };

    try {
      const response = await axios.post('http://localhost:5000/evaluate-candidates', data);
      return res.status(200).json({ success: true, response: response.data });
    } catch (error) {
      console.error('Error sending POST request:', error.message);
      return res.status(500).json({ success: false, message: 'POST request failed' });
    }
  }
}
