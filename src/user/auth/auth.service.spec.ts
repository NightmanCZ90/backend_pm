import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { prismaMock } from '../../prisma/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          // implementation for refresh token
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        ConfigService,
        JwtService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const dto: SignupDto = {
    email: 'test@test.com',
    password: 'heslo',
    confirmPassword: 'heslo',
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signToken', () => {
    it('should return access token', async () => {
      const token = await service.signToken(1, dto.email);
      expect(token).toHaveProperty('accessToken');
    });
  });

  describe('signup', () => {
    it('throws an error if password not same as confirmPassword', async () => {
      let error: Error;
      try {
        await service.signup({
          email: dto.email,
          password: dto.password,
          confirmPassword: 'heslo1',
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(BadRequestException);
    });

    it('throws an error if user signs up with email in use', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(1);

      let error: Error;
      try {
        await service.signup(dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('should sign up user and return access token', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);
      prisma.user.create = jest
        .fn()
        .mockReturnValue({ id: 1, email: dto.email });

      const token = await service.signup(dto);
      expect(token).toHaveProperty('accessToken');
    });
  });
});
