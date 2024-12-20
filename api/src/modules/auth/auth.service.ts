import {Injectable, NotAcceptableException, UnauthorizedException} from '@nestjs/common';
import {LoginDto} from "./dto/login.dto";
import {UserService} from "../user/user.service";
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {User} from "../user/user.entity";
import {RegisterDto} from "./dto/register.dto";

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user) {
      throw new NotAcceptableException('User already exists');
    }

    // Sprawdzanie czy hasło jest prawidłowe
    if (!registerDto.password) {
      throw new NotAcceptableException('Password is required');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltOrRounds);

    return this.userService.createUser({
      email: registerDto.email,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('could not find the user');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('password dont match');
    }

    if (user && passwordValid) {
      const access_token = await this.createToken(user)
      return {
        access_token: access_token.access_token
      };
    }
  }

  async createToken(user: User): Promise<{ access_token: string }> {
    const payload = {email: user.email, sub: user.id};
    return {
      access_token: this.jwtService.sign(payload, {secret: process.env.JWT_SECRET}),
    };
  }

}
