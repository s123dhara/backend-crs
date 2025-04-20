import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/add')
  create(@Body() createUserDto: CreateUserDto) {
    const UserDto = plainToInstance(CreateUserDto, createUserDto);
    console.log(UserDto)

    return this.usersService.create(UserDto);
  }

  @Get('/')
  findAll() {
    return this.usersService.findAll();
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
