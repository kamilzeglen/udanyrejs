import {
  Injectable,
  Logger,
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user) {
      this.logger.warn(
        `Rejected registration - email already exists: ${registerDto.email}`,
      );
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
    this.logger.log(`Registered new account: ${registerDto.email}`);

    return this.userService.createUser({
      email: registerDto.email,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(
        `Failed login attempt - unknown email: ${loginDto.email}`,
      );
      throw new UnauthorizedException('USER_NOT_EXIST');
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) {
      this.logger.warn(
        `Failed login attempt - wrong password: ${loginDto.email}`,
      );
      throw new UnauthorizedException('PASSWORD_NOT_MATCH');
    }

    if (!user.isActive) {
      this.logger.warn(
        `Failed login attempt - inactive account: ${loginDto.email}`,
      );
      throw new UnauthorizedException('USER_IS_NOT_ACTIVE');
    }

    if (user && passwordValid) {
      await this.logService.createLog(
        'Zalogowano na konto: ' + loginDto.email,
        'SYSTEM',
      );
      this.logger.log(`Successful login: ${loginDto.email}`);

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
