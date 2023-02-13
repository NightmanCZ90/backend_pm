import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  const user: Express.User = {
    userId: 1,
    email: 'test@test.com',
    iat: 1,
    exp: 1,
  };

  describe('createPortfolio', () => {
    const dto: CreatePortfolioDto = {
      name: 'degiro',
      description: '',
      color: 'FFF',
      url: '',
      investorId: 2,
    };

    it('throws an error if investorId same as userId', async () => {

      let error: Error;
      try {
        await controller.createPortfolio({ ...dto, investorId: 1 }, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(BadRequestException);
    });

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

  describe('getUsersPortfolios', () => {
    it('returns object with empty arrays if no portfolios found', async () => {
      prisma.portfolio.findMany = jest.fn().mockReturnValue([]);

      const portfolios = await controller.getUsersPortfolios(user);
      expect(portfolios).toEqual({ managed: [], managing: [], personal: [] });
    });

    it('returns separated portfolios', async () => {
      const userId = 1;
      const managed = [
        { userId, pmId: 2 },
        { userId, pmId: 3 },
      ];
      const managing = [
        { userId: 2, pmId: userId },
        { userId: 3, pmId: userId },
      ];
      const personal = [
        { userId },
        { userId },
      ];

      prisma.portfolio.findMany = jest.fn().mockReturnValue([...managed, ...managing, ...personal]);

      const portfolios = await controller.getUsersPortfolios(user);
      expect(portfolios).toEqual({ managed, managing, personal });
    });
  });

  describe('getPortfolio', () => {
    const portfolioId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.getPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to use the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 2 });

      let error: Error;
      try {
        await controller.getPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('returns portfolio if user is its investor', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId, pmId: 2 });

      const portfolio = await controller.getPortfolio(portfolioId, user);
      expect(portfolio).toEqual({ userId: user.userId, pmId: 2 });
    });

    it('returns portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: user.userId });

      const portfolio = await controller.getPortfolio(portfolioId, user);
      expect(portfolio).toEqual({ userId: 2, pmId: user.userId });
    });
  });
});
