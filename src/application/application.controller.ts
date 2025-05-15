import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Request, Response } from 'express';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post('/apply-job')
  async create(@Req() req: Request, @Res() res: Response) {
    try {
      const { jobDetails, user } = req.body;
      const { status, statusCode, message, application } = await this.applicationService.create(jobDetails, user);
      res.json({ status, message, application });
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Get('/view-applicants/:jobId')
  async viewApplicants(@Req() req: Request, @Res() res: Response) {
    try {

      const { jobId } = req.params;
      console.log(jobId);
      
      const { status, statusCode, message, applicants , jobname} = await this.applicationService.findApplicationsByJobId(jobId);

      res.status(statusCode).json({ status, message, applicants, jobname });

    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server error" });
    }
  }

  @Get()
  findAll() {
    return this.applicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationService.remove(+id);
  }
}
