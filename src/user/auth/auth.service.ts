import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup({
    email,
    password,
    confirmPassword,
  }: SignupDto): Promise<{ accessToken: string }> {
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

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });

    return { accessToken };
  }
}
