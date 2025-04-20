import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy, } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService, @InjectModel(User.name) private userModel: Model<UserDocument>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY') || "secret123secret123"
        });
    }

    async validate(payload: any) {
        console.log(payload);
        const user = await this.userModel.findOne({ email: payload.email });        

        if (!user) return null; // Handle case where user is not found

        return user;
    }

}
