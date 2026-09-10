import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService, AuthSession } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@core/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { extractCookie } from '@core/utils/cookie.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('/myself')
  async getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register({
      email: registerDto.email,
      password: registerDto.password,
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const session = await this.authService.login(loginDto);
    this.setAuthCookies(res, session);
    res.send({ access_token: session.accessToken });
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('/refresh')
  async refresh(@Request() req, @Res() res: Response): Promise<void> {
    const refreshToken = extractCookie(req, 'refresh_token');
    if (!refreshToken) {
      throw new AppException(API_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const session = await this.authService.refreshSession(refreshToken);
    this.setAuthCookies(res, session);
    res.send({ access_token: session.accessToken });
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(
    @Request() req: { user: { sub: string } },
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.sub);
    this.clearAuthCookies(res);
    res.send({ success: true });
  }

  private setAuthCookies(res: Response, session: AuthSession): void {
    const secure = process.env.HTTPS_ENABLED === 'ENABLED';
    const sameSite = secure ? 'none' : 'strict';

    res.cookie('access_token', session.accessToken, {
      expires: new Date(
        Date.now() + Number(process.env.JWT_EXPIRATION_SECONDS) * 1000,
      ),
      sameSite,
      httpOnly: true,
      secure,
      domain: process.env.DOMAINS_WHITELIST,
    });

    // Refresh token wraca do serwera wyłącznie na ścieżce /auth (refresh,
    // logout) - nie ma powodu wysyłać go z każdym żądaniem do API.
    res.cookie('refresh_token', session.refreshToken, {
      expires: session.refreshTokenExpiresAt,
      sameSite,
      httpOnly: true,
      secure,
      domain: process.env.DOMAINS_WHITELIST,
      path: '/auth',
    });
  }

  private clearAuthCookies(res: Response): void {
    const secure = process.env.HTTPS_ENABLED === 'ENABLED';
    const sameSite = secure ? 'none' : 'strict';

    res.clearCookie('access_token', {
      sameSite,
      httpOnly: true,
      secure,
      domain: process.env.DOMAINS_WHITELIST,
    });
    res.clearCookie('refresh_token', {
      sameSite,
      httpOnly: true,
      secure,
      domain: process.env.DOMAINS_WHITELIST,
      path: '/auth',
    });
  }
}
