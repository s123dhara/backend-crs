import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { response } from 'express';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService, private configService: ConfigService) {
  }
  async adminLogin(dto: AuthDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email: dto.email });
    // console.log(user)

    if (!user) {
      throw new HttpException('Credentials Incorrect', HttpStatus.BAD_REQUEST);
    }

    const userPassword = user.password_hash || '';
    const isPasswordMatch = await argon2.verify(userPassword, dto.password + user.salt);

    if (!isPasswordMatch) {
      throw new HttpException('Credentials Incorrect', HttpStatus.BAD_REQUEST);
    }

    const token = await this.signToken(user.email);
    // console.log(token)

    return { token: token.access_token }; // ✅ return token only
  }



  async signToken(email: string): Promise<any> {
    const payload = {
      email: email,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      // secret: this.configService.get<string>('JWT_SECRET_KEY'),
      secret: 'secret',
    });

    return {
      access_token: token,
    };
  }
}
