import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto'
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<any> {

    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if(existingUser != null) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }    
    
    const createdUser = new this.userModel(createUserDto);
    const salt = randomBytes(16).toString('hex');
    const hashPassword = await argon2.hash(createUserDto.password_hash + salt);
    createdUser.password_hash = hashPassword;
    createdUser.salt = salt;
    const savedUser = await createdUser.save();

    return { satusCode : HttpStatus.CREATED, message : "User created successfully"};
  }

  findAll() {
    return { msg: `This action returns all users` };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
