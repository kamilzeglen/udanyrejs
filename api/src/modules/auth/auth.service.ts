import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user) {
      throw new NotAcceptableException('User already exists');
    }

    if (!registerDto.password) {
      throw new NotAcceptableException('Password is required');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      saltOrRounds,
    );

    await this.logService.createLog(
      'Dodano konto:' + registerDto.email,
      'SYSTEM',
    );

    return this.userService.createUser({
      email: registerDto.email,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('USER_NOT_EXIST');
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('PASSWORD_NOT_MATCH');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('USER_IS_NOT_ACTIVE');
    }

    if (user && passwordValid) {
      await this.logService.createLog(
        'Zalogowano na konto: ' + loginDto.email,
        'SYSTEM',
      );

      const access_token = await this.createToken(user);
      return {
        access_token: access_token.access_token,
      };
    }
  }

  async createToken(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }
}
