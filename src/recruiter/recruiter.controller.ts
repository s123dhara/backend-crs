import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { RecruiterService } from './recruiter.service';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { JobService } from './job.service';

@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService,
    private readonly jobService: JobService
  ) { }

  @Post()
  create(@Body() createRecruiterDto: CreateRecruiterDto) {
    return this.recruiterService.create(createRecruiterDto);
  }

  @Get('/all-jobs')
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const { status, statusCode, message, jobs } = await this.jobService.findAll();
      res.status(statusCode).json({ status, message, jobs });
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recruiterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecruiterDto: UpdateRecruiterDto) {
    return this.recruiterService.update(+id, updateRecruiterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recruiterService.remove(+id);
  }

  @Post('/company-profile')
  async addCompanyProfile(@Req() req: Request, @Res() res: Response) {

    try {
      // name: "",
      //   description: "",
      //   industry: "",
      //   website: "",
      //   logo_url: "",
      //   employee_count_range: "",
      //   headquarters: "",
      //   founded_year: ""
      const { formData, user } = req.body;
      // const body = { name, description, industry, website, employee_count_range, headquarters, founded_year };

      console.log(req.body);

      const { statusCode, status, message } = await this.recruiterService.addCompanyProfile(formData, user);
      res.status(statusCode).json({ status, message });
      // res.status(201).json({ status: true, message: "Company Profile Created" });

    } catch (error) {
      console.log('Error Company Profile creation :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Post('/get-company-profile')
  async getCompanyProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const { user } = req.body;
      const { statusCode, status, message, profile } = await this.recruiterService.getCompanyProfile(user);

      res.status(statusCode).json({ status, message, profile });
    } catch (error) {
      console.log('Error Company Profile creation :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Post('/update-company-profile')
  async updateCompanyProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const { formData } = req.body;
      const { statusCode, status, message } = await this.recruiterService.updateCompanyProfile(formData);

      res.status(statusCode).json({ status, message });
    } catch (error) {
      console.log('Error Company Profile creation :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }


  @Post('/job/add')
  async createJob(@Req() req: Request, @Res() res: Response) {
    try {
      const { formData, user } = req.body;
      const { statusCode, status, message } = await this.jobService.create(formData, user);
      res.status(statusCode).json({ status, message });
    } catch (error) {
      console.log('Error job creation :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Get('/job/edit/:jobId')
  async getJob(@Req() req: Request, @Res() res: Response) {
    try {
      const { jobId } = req.params;
      const { statusCode, status, job } = await this.jobService.findOne(jobId);
      res.status(statusCode).json({ status, job });

    } catch (error) {
      console.log('Error job :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Post('/job/edit/:jobId')
  async updateJob(@Req() req: Request, @Res() res: Response) {
    try {
      const { jobId } = req.params;
      const { formData } = req.body;
      const { statusCode, status, job, message } = await this.jobService.update(jobId, formData);
      res.status(statusCode).json({ status, job, message });

    } catch (error) {
      console.log('Error job :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Post('/job/delete')
  async deleteJob(@Req() req: Request, @Res() res: Response) {
    try {
      const { job_id } = req.body;
      const { statusCode, status, message } = await this.jobService.delete(job_id);
      res.status(statusCode).json({ status, message });

    } catch (error) {
      console.log('Error job :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Post('/jobs')
  async findJobsByComapnyId(@Req() req: Request, @Res() res: Response) {
    try {
      const { user } = req.body;
      const { statusCode, status, jobs } = await this.jobService.findAllJobsByCompany(user);
      res.status(statusCode).json({ status, jobs });
    } catch (error) {

      console.log('Error Job Listing  :', error.message);
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }
}
