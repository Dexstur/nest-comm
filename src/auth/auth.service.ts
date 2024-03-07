import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, username, password, adminKey } = dto;

    try {
      const mail = email.toLowerCase().trim();

      const existing = await this.prisma.user.findUnique({
        where: {
          email: mail,
        },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }

      const adminSecret = this.config.get('ADMIN_SECRET');

      if (adminKey && adminKey !== adminSecret) {
        throw new ForbiddenException('Invalid admin key');
      }

      const unique = await this.uniqueName(username);
      const hash = await argon.hash(password);

      const user = await this.prisma.user.create({
        data: {
          email: mail,
          username: unique,
          password: hash,
          authority: adminKey ? 2 : 0,
        },
      });

      const token = this.signToken(user.id.toString(), user.authority);
      delete user.password;

      return {
        message: 'Signup successful',
        data: user,
        token,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw new ForbiddenException(err.message);
      }
      if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      }

      throw new Error(err.message);
    }
  }

  async login(dto: LoginDto) {
    const { email, username, password } = dto;

    const mail = email?.toLowerCase().trim();

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              email: mail,
            },
            {
              username,
            },
          ],
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const valid = await argon.verify(user.password, password);

      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.signToken(user.id, user.authority);
      delete user.password;

      return {
        message: 'Login successful',
        data: user,
        token,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new Error(err.message);
    }
  }
  signToken(id: string, authority: number) {
    const payload = { id, authority };
    const secret = this.config.get('JWT_SECRET');
    const expiresIn = this.config.get('JWT_EXPIRY');

    return this.jwt.sign(payload, { secret, expiresIn });
  }

  async uniqueName(username: string) {
    username = username.trim();
    const existing = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!existing) {
      return username;
    } else {
      const suffix = Math.floor(Math.random() * 100) + 1;
      return this.uniqueName(`${username}${suffix}`);
    }
  }
}
