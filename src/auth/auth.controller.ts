import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private jwtService : JwtService) { }

  @Post('/admin/login')
  async adminLogin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // console.log(dto);
    const data = await this.authService.adminLogin(dto);

    // console.log(data)

    res.cookie('access_token', data.token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User logged in successfully',
    };
  }

  @Post('/admin/logout')
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { satusCode: HttpStatus.OK, message: "logged out" };
  }


  @Post('check')
  async checkAuth(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['access_token'];


    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthenticated: false });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'secret', // or use configService.get('JWT_SECRET_KEY')
      });

      return res.status(HttpStatus.OK).json({
        isAuthenticated: true,
        user: payload, // { email: ..., iat: ..., exp: ... }
      });
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthenticated: false });
    }
  }


}
