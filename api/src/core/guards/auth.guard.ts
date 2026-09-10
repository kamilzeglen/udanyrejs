import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      this.logger.warn(
        `Rejected request with invalid/expired token on ${request.method} ${request.url}: ${error.message}`,
      );
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookies = request.headers.cookie;
    if (cookies) {
      const cookiePairs = cookies.split('; ');
      const tokenPair = cookiePairs.find((pair) =>
        pair.startsWith('access_token='),
      );
      if (tokenPair) {
        return tokenPair.split('=')[1];
      }
    }
    return undefined;
  }
}
