import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, UseGuards, UseInterceptors, UploadedFiles, UploadedFile, } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { JwtGuard } from '../auth/guard'
import { ApplicationFormStorage, BulkMailStorage, fileFilter } from '../utils/multer.storage';
import { MAX_FILE_SIZE } from '../config/constants';
import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import { extname } from 'path';
import { EmailService } from '../Mailer/EmailService';





@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly mailerService: EmailService) { }

  @Post('/add')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const UserDto = plainToInstance(CreateUserDto, createUserDto);
      // console.log(UserDto)
      const { status, statusCode, message } = await this.usersService.create(UserDto);
      return res.status(statusCode).json({ status, message });
    } catch (error) {
      return res.status(501).json({ status: false, message: "Interval Server Error" });
    }
  }


  @UseGuards(JwtGuard)
  @Get('/')
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const { status, statusCode, message, data } = await this.usersService.findAll();
      res.status(statusCode).json({ status, message, data });
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server Error" });
    }
  }

  @UseGuards(JwtGuard)
  @Get('/edit/:id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const { status, statusCode, message, data } = await this.usersService.findOne(id);
      res.status(statusCode).json({ status, message, data });
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post(':id')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      // const { email, password, status, role } = req.body;
      const data = req.body;
      console.log(data)
      const { status, message, statusCode } = await this.usersService.update(id, data);
      return res.status(statusCode).json({ status, message })
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post('/delete/:id')
  async remove(@Req() req: Request, @Res() res: Response) {
    try {
      const { userId } = req.body;
      console.log({ userId })
      const { status, message, statusCode } = await this.usersService.remove(userId);
      return res.status(statusCode).json({ status, message })
    } catch (error) {
      res.status(502).json({ status: false, message: "Internal Server Error" });
    }
  }

  @UseGuards(JwtGuard)
  @UseInterceptors(AnyFilesInterceptor({
    storage: ApplicationFormStorage, fileFilter, limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  @Post("/apply/application-form")
  async handleApplicationForm(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      console.log('Received text fields:', req.body);
      console.log('Uploaded files:', files);

      const { formData, userEmail } = req.body;
      const parsedFormData = JSON.parse(req.body.formData);
    
      const result = await this.usersService.handleApplicationForm(parsedFormData, userEmail, files);
      console.log(result);

      return res.status(201).json({
        message: 'Application received',
        status: true,
      });
    } catch (error) {
      console.error('Controller Error:', error.message);
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }

  @Post('/bulk-mail/upload')
  @UseInterceptors(FileInterceptor('file', { storage: BulkMailStorage }))
  async handleBulkMail(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const { subject, company } = req.body;
      console.log('Received text fields:', req.body);
      console.log('Uploaded file:', file);

      const extension = extname(file.originalname).toLowerCase();
      if (extension !== '.csv') {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          status: false,
          message: 'Only CSV files are supported.',
        });
      }

      const emails: string[] = [];

      fs.createReadStream(file.path)
        .pipe(csvParser())
        .on('data', (row) => {
          console.log('row = ', row);
          const rawEmail = row.email || row.EMAIL; // ✅ Handles both cases

          if (rawEmail && typeof rawEmail === 'string') {
            emails.push(rawEmail.trim());
          }
        })
        .on('end', async () => {
          fs.unlinkSync(file.path); // cleanup

          const uniqueEmails = [...new Set(emails)];

          const result = await this.mailerService.sendBulkEmails(uniqueEmails, subject, company);
          console.log({
            result
          })
          for(let obj in result.success) {
            console.log(result.success[obj]);
          }
          console.log(uniqueEmails);
          console.log(emails);
          return res.status(201).json({
            status: true,
            message: 'Emails extracted successfully.',
            total: uniqueEmails.length,
            emails: uniqueEmails,
          });
        })
        .on('error', (error) => {
          fs.unlinkSync(file.path);
          console.error('CSV Parse Error:', error);
          return res.status(500).json({
            message: 'Error parsing CSV file',
            error: error.message,
          });
        });

    } catch (error) {
      console.error('Controller Error:', error.message);
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }


}
