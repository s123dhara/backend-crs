import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto'
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser != null) {
        return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "User Already Exist" };
      }

      const createdUser = new this.userModel(createUserDto);
      const salt = randomBytes(16).toString('hex');
      const hashPassword = await argon2.hash(createUserDto.password_hash + salt);
      createdUser.password_hash = hashPassword;
      createdUser.salt = salt;


      const savedUser = await createdUser.save();
      return { statusCode: HttpStatus.CREATED, message: "User added Successfully", status: true };
    } catch (error) {
      return { status: false, statusCode: HttpStatus.BAD_GATEWAY, message: "Interval Server Error" }
    }
  }

  async findAll(): Promise<any> {
    try {
      const users = await this.userModel.find({}, {
        _id: 0,
        email: 1,
        role: 1,
        status: 1,
        createdAt: 1,
      });

      // console.log('users = ',users)
      // const usersWithId = users.map((user, index) => ({
      //   id: index + 1,
      //   ...user
      // }));

      return {
        status: true,
        statusCode: HttpStatus.OK,
        message: "Request allowed",
        data: users,
      };
    } catch (error) {
      // console.error('FindAll Error:', error);

      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server1 Error",
      };
    }
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
