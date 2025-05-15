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


  @Post('/login')
  async login(@Body() dto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, message, status, statusCode, two_fa_auth_enabled, user } = await this.authService.adminLogin(dto, "APPLICANT");

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

  @Post('/admin/login')
  async adminLogin(
    @Body() dto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, message, status, statusCode, two_fa_auth_enabled, user } = await this.authService.adminLogin(dto, "ADMIN");

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
    return { satusCode: HttpStatus.OK, message: "Successfully Logged out", status: true };
  }

  @Post('/recruiter/login')
  async recruiterLogin(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, role } = req.body;
      const data = { email, password };      
      const { access_token, refresh_token, message, status, statusCode, two_fa_auth_enabled, user } = await this.authService.adminLogin(data, role.toUpperCase());
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

    } catch (error) {
      console.error('Signup Error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post('/check')
  async checkAuth(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refresh_token'];
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

      const { status, newAccessToken, updatePayload, statusCode, message } = await this.authService.authCheck(payload);
      if (!status) {
        return res.status(statusCode).json({ status, message, isAuthenticated: false })
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
    try {
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
    } catch (error) {
      console.error('Enable 2fa Error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }


  }

  @Post('/admin/disable-2fa')
  async disable2FAsetup(@Req() req: Request, @Res() res: Response) {

    try {
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

      res.status(statusCode).json({ status, message });
    } catch (error) {
      console.error('Disable 2fa error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }


  }

  @Post('/admin/init-2fa')
  async init2fa(@Req() req: Request, @Res() res: Response) {
    try {
      const { method, user } = req.body;
      if (!method || !user) {
        return res.status(401).json({ status: false, message: "Invalid Request" });
      }

      const { status, message, statusCode } = await this.twofaAuthService.init2fa(user, method);
      console.log({ status, message, statusCode })
      res.status(statusCode).json({ status, message });
    } catch (error) {
      res.status(401).json({ status: false, message: "Something went wrong, Please try again later" });
    }

  }

  @Post('/admin/verify-auth-token')
  async verify2fa(@Req() req: Request, @Res() res: Response): Promise<Response> {
    try {
      const { code, method, user } = req.body;
      if (!code || !method || !user) {
        return res.status(401).json({ status: false, message: "Invalid Request" });
      }

      const result = await this.twofaAuthService.verifyAuthToken(code, method, user);

      console.log({ result });

      if (!result.status || !result.isVerified) {
        return res.status(401).json({ status: false, message: "Invalid or expired token", isVerified: false });
      }

      const { access_token, refresh_token } = await this.authService.signToken(user.email, user.two_fa_methods);

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false, // set to true in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(HttpStatus.CREATED).json({
        status: true,
        message: 'Logged In Successfully',
        user,
        token: access_token,
      });

    } catch (error) {
      console.error('2FA Verification Error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const { email } = req.body;
      const { status, statusCode, message } = await this.authService.forgotPassword(email);
      if (status) {
        return res.status(200).json({ status: true, message: "true" });
      } else {
        return res.status(statusCode).json({ status, message });
      }
    } catch (error) {
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post('/signup')
  async signup(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ status: false, message: "Email and password are required" });
      }

      const { status, message, statusCode } = await this.authService.signup({ email, password, role : "APPLICANT" });

      return res.status(statusCode).json({ status, message });

    } catch (error) {
      console.error('Signup Error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  @Post('/recruiter/signup')
  async recruiterSignup(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ status: false, message: "Email and password are required" });
      }

      const { status, message, statusCode } = await this.authService.signup({ email, password, role : "RECRUITER" });

      return res.status(statusCode).json({ status, message });

    } catch (error) {
      console.error('Signup Error:', error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

}
