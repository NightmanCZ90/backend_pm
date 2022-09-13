import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../../prisma/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        ConfigService,
        JwtService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const dto: SignupDto = {
    email: 'test@test.com',
    password: 'heslo',
    confirmPassword: 'heslo',
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('throws an error if password not same as confirmPassword', async () => {
      let error: Error;
      try {
        await controller.signup({
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
        await controller.signup(dto);
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

      const token = await controller.signup(dto);
      expect(token).toHaveProperty('accessToken');
    });
  });
});
