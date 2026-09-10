import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { extractCookie } from '@core/utils/cookie.util';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractCookie(request, 'access_token');
    if (!token) {
      throw new AppException(API_ERRORS.UNAUTHORIZED);
    }
    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      this.logger.warn(
        `Rejected request with invalid/expired token on ${request.method} ${request.url}: ${error.message}`,
      );
      throw new AppException(API_ERRORS.UNAUTHORIZED);
    }
    return true;
  }
}
