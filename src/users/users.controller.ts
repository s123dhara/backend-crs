import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';

import { JwtGuard } from '../auth/guard'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/add')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const UserDto = plainToInstance(CreateUserDto, createUserDto);
      console.log(UserDto)
      const { status, statusCode, message } = await this.usersService.create(UserDto);
      console.log({ status, statusCode, message })
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

  @Get('/edit/:id')
  findOne(@Param('id') id: string) {
    console.log(id)
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
