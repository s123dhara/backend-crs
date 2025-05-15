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
import { EmailService } from '../Mailer/EmailService';
import { randomBytes } from 'crypto';
import { ApplicantProfile } from '../users/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService, private configService: ConfigService,
    private twoFactorAuthService: TwoFactorAuthService, private emailService: EmailService,
    @InjectRepository(ApplicantProfile) private readonly applicantProfileRepository: Repository<ApplicantProfile>
  ) {
  }
  async adminLogin(dto: AuthDto, role: String): Promise<any> {
    const user = await this.userModel.findOne({ email: dto.email, role: role });
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
      two_fa_methods: user.two_fa_methods,
      role: user?.role
    }
    if (user.two_fa_enabled == true) {
      return { access_token: null, refresh_token: null, status: false, two_fa_auth_enabled: true, user: requiredUserDetails };
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
      return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "Auth Checking Failed" };
    }
    const user_id = (user?._id as any).toString() || null;

    const applicantProfile = await this.applicantProfileRepository.findOne({
      where: {
        user_id: user_id
      },
      select : ['is_profile_complete']
    })

    let isProfileComplete = applicantProfile?.is_profile_complete ;

    if(isProfileComplete == undefined) {
      isProfileComplete = false
    }

    console.log('authe c=', isProfileComplete);

    const updatePayload = {
      email: user?.email,
      two_fa_methods: user?.two_fa_methods,
      role: user?.role,
      isProfileComplete
    }

    const newAccessToken = await this.jwtService.signAsync(updatePayload, {
      expiresIn: '15m',
    });

    return { status: true, newAccessToken, updatePayload };

  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { status: false, statusCode: HttpStatus.BAD_GATEWAY, message: "Not Allowed to Verify" };
    }

    const result = await this.emailService.userForgetEmailVerification(email);
    if (result) {
      return { status: true, statusCode: HttpStatus.OK, message: "Success" };
    } else {
      return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "Failed" };
    }
  }

  async signup(data: any): Promise<any> {
    try {
      const { email, password, role } = data;
      const user = await this.userModel.findOne({ email });

      if (user) {
        return { status: false, statusCode: HttpStatus.BAD_REQUEST, message: "User Already Exist" };
      }

      const salt = randomBytes(16).toString('hex');
      const hashPassword = await argon2.hash(password + salt);

      const createdUser = new this.userModel({
        email,
        password_hash: hashPassword,
        salt, 
        role
      });

      await createdUser.save();

      return { statusCode: HttpStatus.CREATED, message: "User Signup Successfully", status: true };

    } catch (error) {
      console.error(error);
      return {
        status: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      };
    }
  }


}
