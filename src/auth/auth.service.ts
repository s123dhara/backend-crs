import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { response } from 'express';
import { ACCRESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME } from '../config/constants';
import { TwoFactorAuthService } from './2fa/twofactor.auth.service';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService, private configService: ConfigService, private twoFactorAuthService: TwoFactorAuthService) {
  }
  async adminLogin(dto: AuthDto): Promise<any> {
    const user = await this.userModel.findOne({ email: dto.email });
    // console.log(user)

    if (!user) {
      return { access_token: null, refresh_token: null, status: false, message: "Credentials Incorrect", statusCode: HttpStatus.BAD_REQUEST };
    }

    const userPassword = user.password_hash || '';
    const isPasswordMatch = await argon2.verify(userPassword, dto.password + user.salt);

    if (!isPasswordMatch) {
      return { access_token: null, refresh_token: null, status: false, message: "Credentials Incorrect", statusCode: HttpStatus.BAD_REQUEST };
    }

    //checks 2fa enabled or not. 
    const requiredUserDetails = {
      email: user.email,
      two_fa_methods: user.two_fa_methods
    }
    if(user.two_fa_enabled == true) {
      return { access_token: null, refresh_token: null, status: false, two_fa_auth_enabled : true, user : requiredUserDetails};
    }

    const { access_token, refresh_token } = await this.signToken(user.email, user.two_fa_methods);
    // console.log(token)

    return { access_token, refresh_token, status: true, user: requiredUserDetails }; // ✅ return tokens only
  }

  async signToken(email: string, two_fa_methods: any): Promise<any> {
    const payload = {
      email: email,
      two_fa_methods
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: ACCRESS_TOKEN_EXPIRE_TIME,
      secret: this.configService.get<string>('JWT_SECRET_KEY') || '',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
    })

    return {
      access_token, refresh_token,
    };
  }

  async authCheck(payload: any): Promise<any> {
    const { exp, iat, ...cleanPayload } = payload;
    const user = await this.userModel.findOne({ email: cleanPayload?.email });

    if (!user) {

    }

    const updatePayload = {
      email: user?.email,
      two_fa_methods: user?.two_fa_methods
    }

    const newAccessToken = await this.jwtService.signAsync(updatePayload, {
      expiresIn: '15m',
    });

    return { status: true, newAccessToken, updatePayload };

  }



}
