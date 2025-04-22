import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

import { APP_NAME } from "../../config/constants";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

import { OtpService } from "../otp/otp.service";
import { EmailService } from "../../Mailer/EmailService";

@Injectable()
export class TwoFactorAuthService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService, private configService: ConfigService, private otpService: OtpService, private emailService: EmailService) {}

    async enable2faSetup(password: string, two_fa_mode: string, token: string): Promise<any> {

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
            });

            // 🧹 Remove `exp`, `iat`, etc.
            const { exp, iat, ...cleanPayload } = payload;
            const { email } = cleanPayload;

            const user = await this.userModel.findOne({ email: email });
            if (!user) {
                return { status: false, message: 'User not found!' };
            }

            const userPassword = user.password_hash || '';
            const isPasswordMatch = await argon2.verify(userPassword, password + user.salt);

            if (!isPasswordMatch) {
                return { status: false, message: "Password Incorrect", statusCode: HttpStatus.BAD_REQUEST };
            }

            switch (two_fa_mode.toUpperCase()) {
                case 'EMAIL':
                    user.two_fa_enabled = true;
                    if (!user.two_fa_methods.includes('EMAIL')) {
                        user.two_fa_methods.push('EMAIL');
                    }
                    user.two_fa_verified = false; // after logged in make it true
                    await user.save();

                    return { status: true, message: 'Email OTP Verification enabled', statusCode: HttpStatus.OK }
                case 'TOTP':
                    const { secret } = await this.generateSecret(email);
                    // Step 2: Save secret to user (but NOT verified yet)
                    user.two_fa_secret = secret.base32;
                    user.two_fa_enabled = true;
                    if (!user.two_fa_methods.includes('TOTP')) {
                        user.two_fa_methods.push('TOTP');
                    }
                    user.two_fa_verified = false; // after logged in make it true
                    await user.save();

                    const { qrCode } = await this.generateQrCode(secret);

                    return { status: true, message: 'TOTP 2FA setup initialized. Please scan the QR and verify.', qrCode, secret: secret.base32, statusCode: HttpStatus.OK }

                default:
                    return { status: false, message: 'Invalid 2FA mode!' };

            }

        } catch (error) {
            return { status: false, message: "Something went wrong", statusCode: HttpStatus.BAD_GATEWAY }
        }

    }
 
    async disable2faSetup(password: string, two_fa_mode: string, token: string): Promise<any> {

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
            });

            // 🧹 Remove `exp`, `iat`, etc.
            const { exp, iat, ...cleanPayload } = payload;
            const { email } = cleanPayload;

            const user = await this.userModel.findOne({ email: email });
            if (!user) {
                return { status: false, message: 'User not found!' };
            }

            const userPassword = user.password_hash || '';
            const isPasswordMatch = await argon2.verify(userPassword, password + user.salt);

            if (!isPasswordMatch) {
                return { status: false, message: "Password Incorrect", statusCode: HttpStatus.BAD_REQUEST };
            }

            switch (two_fa_mode.toUpperCase()) {
                case 'EMAIL':
                    user.two_fa_methods = user.two_fa_methods.filter(method => method !== 'EMAIL');
                    if (user.two_fa_methods.length === 0) {
                        user.two_fa_enabled = false;
                    } else {
                        user.two_fa_enabled = true;
                    }

                    await user.save();
                    return { status: true, message: 'EMAIL off', statusCode: HttpStatus.OK }
                case 'TOTP':

                    // Step 2: Save secret to user (but NOT verified yet)
                    user.two_fa_secret = '';
                    user.two_fa_methods = user.two_fa_methods.filter(method => method !== 'TOTP');

                    if (user.two_fa_methods.length === 0) {
                        user.two_fa_enabled = false;
                    } else {
                        user.two_fa_enabled = true;
                    }
                    user.two_fa_verified = false;
                    await user.save();

                    return { status: true, message: 'TOTP off.', statusCode: HttpStatus.OK }

                default:
                    return { status: false, message: 'Invalid 2FA mode!' };

            }

        } catch (error) {
            return { status: false, message: "Something went wrong", statusCode: HttpStatus.BAD_GATEWAY }
        }

    }

    async verify2FASetup(user: UserDocument | any, token: string): Promise<any> {
        const isVerified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token
        });

        if (isVerified) {
            user.two_fa_enabled = true;
            user.two_fa_method = 'TOTP';
            user.two_fa_verified = true;
            await user.save();
        }

        return { isVerified };
    }

    async generateSecret(userEmail: string): Promise<any> {
        const secret = speakeasy.generateSecret({
            name: `${APP_NAME} \n${userEmail}`,
        });
        return { secret };
    }

    async generateQrCode(secret: any): Promise<any> {
        const qrCode = await qrcode.toDataURL(secret.otpauth_url ? secret.otpauth_url : "");
        return { qrCode };
    }

    async verifyAuthToken(code: string, method: string, user: any): Promise<any> {
        try {
            let isVerified = false;

            if (method === 'email') {
                const dbUser = await this.userModel.findOne({ email: user?.email });
                if (!dbUser) {
                    return { status: false };
                }


                //Convert User id from OjbectedId to String to Sava in REDITS-DB
                const userId = (dbUser._id as any).toString() || null;
                const storedOtp = await this.otpService.getOtp(userId);
                isVerified = storedOtp === code;


                if (isVerified) await this.otpService.deleteOtp(userId); // cleanup

            } else if (method === 'app') {
                const dbUser = await this.userModel.findOne({ email: user?.email });
                if (!dbUser) {
                    return { status: false, isVerified: false };
                }
                const secret = dbUser?.two_fa_secret || ""; // or fetch from DB
                if (!secret) {
                    return { status: false, isVerified: false };
                }

                //cheking the verification
                isVerified = speakeasy.totp.verify({
                    secret,
                    encoding: 'base32',
                    token: code,
                    window: 1,
                });
            }

            return { status: isVerified, isVerified };
        } catch (error) {
            return { status: false, isVerified: false };
        }
    }

    async init2fa(user: any, method: string): Promise<any> {
        try {
            if (method == 'email') {
                const dbUser = await this.userModel.findOne({ email: user?.email });
                if (!dbUser) {
                    return { status: false, messsage: "Something went wrong, Please try again later", statusCode: HttpStatus.BAD_REQUEST }
                }
                const { status, message } = await this.adminSendEmailOTP(dbUser);
                console.log({ status, message })
                if (status) {
                    return { status, message, statusCode: HttpStatus.OK };
                } else {
                    return { status: false, messsage: "Something went wrong, Please try again later", statusCode: HttpStatus.BAD_GATEWAY }
                }
            }

            if (method == 'app') {
                return { status: true, message: 'OTP generated in authenticator app', statusCode: HttpStatus.OK }
            }
        } catch (error) {
            return { status: false, messsage: "Something went wrong, Please try again later", statusCode: HttpStatus.BAD_GATEWAY }
        }
    }

    async adminSendEmailOTP(user: any): Promise<any> {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const userId = (user._id as any).toString() || null;
            await this.otpService.storeOtp(userId, otp, 300); // 5 mins

            const result = await this.emailService.adminEmailVerificationOtp('spdh427@gmail.com', user.email, otp);
            if (result) {
                return { status: true, message: 'OTP sent to email' };
            } else {
                return { status: false, message: "Failed in OTP sending in Email, Please try again later" }
            }
        } catch (error) {
            return { status: false, message: "Failed in OTP sending in Email, Please try again later" }
        }
    }
}