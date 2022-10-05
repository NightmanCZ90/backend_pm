import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon from 'argon2';

import { prismaMock } from '../../prisma/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const signupDto: SignupDto = {
    email: 'test@test.com',
    password: 'heslo',
    confirmPassword: 'heslo',
  };

  describe('signToken', () => {
    it('should return access token', async () => {
      const token = await service.signToken(1, signupDto.email);
      expect(token).toHaveProperty('accessToken');
    });
  });

  describe('signup', () => {
    it('throws an error if password not same as confirmPassword', async () => {
      let error: Error;
      try {
        await service.signup({
          email: signupDto.email,
          password: signupDto.password,
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
        await service.signup(signupDto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('should sign up user and return access token', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);
      prisma.user.create = jest
        .fn()
        .mockReturnValue({ id: 1, email: signupDto.email });

      const token = await service.signup(signupDto);
      expect(token).toHaveProperty('accessToken');
    });
  });

  describe('signin', () => {
    const signinDto: SigninDto = {
      email: 'test@test.com',
      password: 'heslo',
    };

    it('throws an error if user does not exist in db', async () => {
      let error: Error;

      prisma.user.findUnique = jest.fn().mockReturnValue(null);
      try {
        await service.signin({
          email: signinDto.email,
          password: signinDto.password,
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('throws an error if user password does not match with hashed password', async () => {
      const hash = await argon.hash('jineheslo');
      prisma.user.findUnique = jest.fn().mockReturnValue({ password: hash });

      let error: Error;
      try {
        await service.signin(signinDto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('should sign in user and return access token', async () => {
      const hash = await argon.hash(signinDto.password);
      prisma.user.findUnique = jest.fn().mockReturnValue({
        email: signinDto.email,
        password: hash,
      });

      const token = await service.signin(signinDto);
      expect(token).toHaveProperty('accessToken');
    });
  });
});
