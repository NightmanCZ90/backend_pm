import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async signup({
    email,
    password,
    confirmPassword,
  }: SignupDto): Promise<Tokens> {
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'confirm password must be same as password',
      );
    }
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ForbiddenException('email in use');
    }

    const hash = await argon.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });

    const token = this.signToken(user.id, user.email);
    return token;
  }

  async signin({
    email,
    password,
  }: SigninDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const token = this.signToken(user.id, user.email);
    return token;
  }

  async refreshTokens(
    user: { userId: number; email: string }
  ): Promise<Tokens> {
    const token = this.signToken(user.userId, user.email);
    return token;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<Tokens> {
    const payload: JwtPayload = {
      userId,
      email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '1h',
        secret: this.config.get('JWT_SECRET_ACCESS'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '1 day',
        secret: this.config.get('JWT_SECRET_REFRESH'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
