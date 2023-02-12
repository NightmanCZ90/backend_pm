import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UserController', () => {
  let controller: UsersController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('returns all users from database', async () => {
      const users = [
        { id: 1, email: 'email1' },
        { id: 2, email: 'email2' }
      ]
      prisma.user.findMany = jest.fn().mockReturnValue(users);

      const returnedUsers = await controller.getAllUsers();
      expect(returnedUsers).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('throws an error if user not found', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.getUserById(1);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('returns back found user', async () => {
      const user = { id: 1, email: 'email1' };
      prisma.user.findUnique = jest.fn().mockReturnValue(user);

      const returnedUser = await controller.getUserById(1);
      expect(returnedUser).toEqual(user);
    });
  });

  describe('getCurrentUser', () => {
    const currentUser = {
      userId: 1,
      email: 'test@test.com',
      iat: 1,
      exp: 1,
    };

    it('throws an error if current user not found', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.getCurrentUser(currentUser);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('returns back current user', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(currentUser);

      const returnedUser = await controller.getUserById(1);
      expect(returnedUser).toEqual(currentUser);
    });
  });
});
