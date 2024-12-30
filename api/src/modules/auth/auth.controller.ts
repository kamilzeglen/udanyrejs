import {Body, Controller, Get, InternalServerErrorException, Post, Request, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from "./dto/login.dto";
import {Response} from "express";
import {User} from "../user/user.entity";
import {RegisterDto} from "./dto/register.dto";
import {AuthGuard} from "./guards/auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
  }

  @UseGuards(AuthGuard)
  @Get('/myself')
  async getProfile(
    @Request() req: { user: User },
    @Res({passthrough: true}) res
  ) {
    const result = await this.authService.createToken(req.user);
    if (!result.access_token) {
      throw new InternalServerErrorException('ERROR_GENERATING_SECURITY_TOKEN');
    }

    res.cookie('access_token', result.access_token, {
      expires: new Date(new Date().getTime() + 120 * 60 * 1000),  // 2 godziny
      sameSite: process.env.HTTPS_ENABLED === 'ENABLED' ? 'none' : 'strict',
      httpOnly: true,
      secure: process.env.HTTPS_ENABLED === 'ENABLED',
      domain: process.env.DOMAINS_WHITELIST
    });

    return req.user;
  }

  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<User> {
    return this.authService.register({email: registerDto.email, password: registerDto.password})
  }

  @Post("/login")
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response
  ): Promise<any> {
    const loginResponse = await this.authService.login(loginDto);
    res.cookie('access_token', loginResponse.access_token, {
      expires: new Date(new Date().getTime() + 120 * 60 * 1000),  // 2 godziny
      sameSite: process.env.HTTPS_ENABLED === 'ENABLED' ? 'none' : 'strict',
      httpOnly: true,
      secure: process.env.HTTPS_ENABLED === 'ENABLED',
      domain: process.env.DOMAINS_WHITELIST
    });

    return res.send({access_token: loginResponse.access_token});
  }
}
