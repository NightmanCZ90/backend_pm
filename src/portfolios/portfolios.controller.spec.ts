import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dtos';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';

describe('PortfoliosController', () => {
  let controller: PortfoliosController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfoliosController],
      providers: [
        PortfoliosService,
        { provide: PrismaService, useValue: prismaMock },
      ]
    }).compile();

    controller = module.get<PortfoliosController>(PortfoliosController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createPortfolio', () => {
    const dto: CreatePortfolioDto = {
      name: 'degiro',
      description: '',
      color: 'FFF',
      url: '',
      investorId: 1,
    };
    const user: Express.User = {
      userId: 1,
      email: 'test@test.com',
      iat: 1,
      exp: 1,
    };

    it('throws an error if user does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.createPortfolio(dto, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('returns created portfolio', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue('user');
      prisma.portfolio.create = jest.fn().mockReturnValue(dto);

      const portfolio = await controller.createPortfolio(dto, user);
      expect(portfolio).toEqual(dto);
    });
  });
});
