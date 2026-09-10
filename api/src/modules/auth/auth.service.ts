import { Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { randomBytes, createHash } from 'crypto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userService.findOneByEmail(registerDto.email);
    if (user) {
      this.logger.warn(
        `Rejected registration - email already exists: ${registerDto.email}`,
      );
      throw new AppException(API_ERRORS.USER_ALREADY_EXISTS);
    }

    if (!registerDto.password) {
      throw new AppException(API_ERRORS.PASSWORD_REQUIRED);
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

  async login(loginDto: LoginDto): Promise<AuthSession> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(
        `Failed login attempt - unknown email: ${loginDto.email}`,
      );
      throw new AppException(API_ERRORS.USER_NOT_EXIST);
    }

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) {
      this.logger.warn(
        `Failed login attempt - wrong password: ${loginDto.email}`,
      );
      throw new AppException(API_ERRORS.PASSWORD_NOT_MATCH);
    }

    if (!user.isActive) {
      this.logger.warn(
        `Failed login attempt - inactive account: ${loginDto.email}`,
      );
      throw new AppException(API_ERRORS.USER_IS_NOT_ACTIVE);
    }

    await this.logService.createLog(
      'Zalogowano na konto: ' + loginDto.email,
      'SYSTEM',
    );
    this.logger.log(`Successful login: ${loginDto.email}`);

    const {
      token: refreshToken,
      hash,
      expiresAt,
    } = this.generateRefreshToken();
    await this.userService.setRefreshToken(user.id, hash, expiresAt);

    return {
      accessToken: this.signAccessToken(user),
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  // Rotuje refresh token w transakcji z blokadą rekordu, żeby dwa równoległe
  // żądania odświeżenia (np. kilka zakładek naraz) nie wyścigowały się o ten
  // sam sekret - drugie żądanie widzi już zrotowany hash i dostaje 401
  // zamiast po cichu nadpisać sesję pierwszego.
  async refreshSession(rawRefreshToken: string): Promise<AuthSession> {
    if (!rawRefreshToken) {
      throw new AppException(API_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.refreshTokenHash = :tokenHash', { tokenHash })
        .getOne();

      if (
        !user ||
        !user.refreshTokenExpiresAt ||
        user.refreshTokenExpiresAt.getTime() < Date.now()
      ) {
        this.logger.warn('Rejected refresh - token invalid or expired');
        throw new AppException(API_ERRORS.REFRESH_TOKEN_INVALID);
      }

      const {
        token: refreshToken,
        hash,
        expiresAt,
      } = this.generateRefreshToken();
      user.refreshTokenHash = hash;
      user.refreshTokenExpiresAt = expiresAt;
      await manager.save(user);

      this.logger.log(`Refreshed session for: ${user.email}`);

      return {
        accessToken: this.signAccessToken(user),
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
      };
    });
  }

  async logout(userId: string): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }

  private signAccessToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  private generateRefreshToken(): {
    token: string;
    hash: string;
    expiresAt: Date;
  } {
    const token = randomBytes(48).toString('hex');
    const days = Number(process.env.REFRESH_TOKEN_EXPIRATION_DAYS) || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return { token, hash: this.hashToken(token), expiresAt };
  }

  // Refresh token jest losowy i ma dużo entropii (48 bajtów), więc - w
  // odróżnieniu od haseł użytkownika - nie potrzebuje kosztownego,
  // solonego hashu jak bcrypt; szybki, deterministyczny SHA-256 pozwala
  // też odnaleźć sesję po hashu w jednym zapytaniu.
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
