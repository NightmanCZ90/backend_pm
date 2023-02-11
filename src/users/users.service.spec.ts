import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UserService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('returns all users from database', async () => {
      const users = [
        { id: 1, email: 'email1' },
        { id: 2, email: 'email2' }
      ]
      prisma.user.findMany = jest.fn().mockReturnValue(users);

      const returnedUsers = await service.getAllUsers();
      expect(returnedUsers).toEqual(users);
    });
  });
});
