import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TwoFactorAuthService } from './2fa/twofactor.auth.service';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private jwtService: JwtService, private configService: ConfigService, private twofaAuthService: TwoFactorAuthService) { }

  @Post('/admin/login')
  async adminLogin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // console.log(dto);
    const { access_token, refresh_token, message, status, statusCode, two_fa_auth_enabled, user } = await this.authService.adminLogin(dto);
    console.log(
      { access_token, refresh_token, message, status, statusCode }
    )

    if (!status && two_fa_auth_enabled) {
      res.status(HttpStatus.OK).json({ status, two_fa_auth_enabled, user, });
    }
    else if (!status) {
      res.status(400).json({ status, message });
    } else {

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      res
        .status(HttpStatus.CREATED)
        .json({
          message: 'Logged In Successfully',
          user,
          token: access_token
        });
    }




  }

  @Post('/admin/logout')
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { satusCode: HttpStatus.OK, message: "logged out", status: true };
  }


  @Post('/check')
  async checkAuth(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refresh_token'];
    console.log(req.headers.authorization);

    /*
    const authorization_token = req.headers.authorization?.split(' ')[1];
    if(!authorization_token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthenticated: false, message : "Authorization token is missing" });
    }
    */

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthenticated: false });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
      });

      // // Remove `exp`, `iat`, etc.
      // const { exp, iat, ...cleanPayload } = payload;

      // const newAccessToken = await this.jwtService.signAsync(cleanPayload, {
      //   expiresIn: '15m',
      // });

      const { status, newAccessToken, updatePayload } = await this.authService.authCheck(payload);
      if (!status) {

      }

      return res.status(HttpStatus.OK).json({
        isAuthenticated: true,
        user: updatePayload,
        token: newAccessToken,
      });
    } catch (err) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ isAuthenticated: false });
    }
  }



  @Post('/admin/enable-2fa')
  async enable2FAsetup(@Req() req: Request, @Res() res: Response) {
    // let two_fa_mode;
    const { password, multifactorAuth } = req.body;
    let two_fa_mode = multifactorAuth;

    console.log(req.body)
    const token = req.cookies['refresh_token'];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized Access" });
    }

    const result = await this.twofaAuthService.enable2faSetup(password, two_fa_mode, token);
    const { status, message, statusCode, qrCode, secret } = result;

    if (!status) {
      res.status(statusCode).json({ status, message });
    }

    if (qrCode && secret) {
      res.status(statusCode).json({ qrCode, secret, status, message })
    } else {
      res.status(statusCode).json({ status, message });
    }


  }


  @Post('/admin/disable-2fa')
  async disable2FAsetup(@Req() req: Request, @Res() res: Response) {
    // let two_fa_mode;
    const { password, multifactorAuth } = req.body;
    let two_fa_mode = multifactorAuth;

    console.log(req.body)
    const token = req.cookies['refresh_token'];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized Access" });
    }

    const { status, message, statusCode } = await this.twofaAuthService.disable2faSetup(password, two_fa_mode, token);

    if (!status) {
      res.status(statusCode).json({ status, message });
    }

    console.log('succesfull');

    res.status(statusCode).json({ status, message });


  }


  @Post('/admin/init-2fa')
  async init2fa(@Req() req: Request, @Res() res: Response) {
    try {
      const { method, user } = req.body;

      console.log({
        method, user
      });

      const { status, message, satusCode } = await this.twofaAuthService.init2fa(user, method);
      console.log({
        status, message
      })
      res.status(satusCode).json({ status, message });
    } catch (error) {

    }

  }

  @Post('/admin/verify-auth-token')
  async verify2fa(@Req() req: Request, @Res() res: Response) {
    const { code, method, user } = req.body;

    console.log('verify = ', { code, method, user });

    const result = await this.twofaAuthService.verifyAuthToken(code, method, user);

    console.log({
      result
    });

    if (result.isVerified) {
      const { access_token, refresh_token } = await this.authService.signToken(user.email, user.two_fa_methods);

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      res
        .status(HttpStatus.CREATED)
        .json({
          status: true,
          message: 'Logged In Successfully',
          user,
          token: access_token
        });

    } else {
      // res.status(200).json({ status: true, isValid: result.isVerified });
      res.status(400).json({ status: true, message: 'nasdf' });
    }

  }

}
