import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategy';
import jwt from 'jsonwebtoken';

interface PayloadReturn {
  iat: number;
  exp: number;
}

interface RegKeyReturn extends PayloadReturn {
  id: string;
  authority: number;
}
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const secret = this.config.get('JWT_SECRET');

    try {
      const decoded = this.jwtService.verify(token.split(' ')[1], { secret });
      request.user = decoded; // Attach use(r information to the request
      return true;
    } catch (err) {
      console.error(err);
      console.error('Did not resolve token');
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
