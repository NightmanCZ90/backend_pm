import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dtos';
import { PortfoliosService } from './portfolios.service';

describe('PortfoliosService', () => {
  let service: PortfoliosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfoliosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PortfoliosService>(PortfoliosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createPortfolio', () => {
    const dto: CreatePortfolioDto = {
      name: 'degiro',
      description: '',
      color: 'FFFFFF',
      url: '',
      investorId: 1,
    };

    it('throws an error if user does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.createPortfolio(2, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('returns created portfolio', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue('user');
      prisma.portfolio.create = jest.fn().mockReturnValue(dto);

      const portfolio = await service.createPortfolio(2, dto);
      expect(portfolio).toEqual(dto);
    });
  });

  describe('getUsersPortfolios', () => {
    it('returns object with empty arrays if no portfolios found', async () => {
      prisma.portfolio.findMany = jest.fn().mockReturnValue([]);

      const portfolios = await service.getUsersPortfolios(1);
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

      const portfolios = await service.getUsersPortfolios(userId);
      expect(portfolios).toEqual({ managed, managing, personal });
    });
  });

  describe('getPortfolio', () => {
    const portfolioId = 1;
    const userId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.getPortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to use the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 2 });

      let error: Error;
      try {
        await service.getPortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('returns portfolio if user is its investor', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId, pmId: 2 });

      const portfolio = await service.getPortfolio(portfolioId, userId);
      expect(portfolio).toEqual({ userId, pmId: 2 });
    });

    it('returns portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: userId });

      const portfolio = await service.getPortfolio(portfolioId, userId);
      expect(portfolio).toEqual({ userId: 2, pmId: userId });
    });
  });

  describe('updatePortfolio', () => {
    const portfolioId = 1;
    const userId = 1;
    const dto: UpdatePortfolioDto = {
      name: 'degiro',
      description: '',
      color: 'FFFFFF',
      url: '',
    };

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.updatePortfolio(portfolioId, userId, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to update the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 2 });

      let error: Error;
      try {
        await service.updatePortfolio(portfolioId, userId, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('updates portfolio if user is its investor', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId, pmId: 2 });
      prisma.portfolio.update = jest.fn().mockReturnValue(dto);

      const portfolio = await service.updatePortfolio(portfolioId, userId, dto);
      expect(portfolio).toEqual(dto);
    });

    it('updates portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: userId });
      prisma.portfolio.update = jest.fn().mockReturnValue(dto);

      const portfolio = await service.updatePortfolio(portfolioId, userId, dto);
      expect(portfolio).toEqual(dto);
    });
  });

  describe('deletePortfolio', () => {
    const portfolioId = 1;
    const userId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.deletePortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to delete the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 2 });

      let error: Error;
      try {
        await service.deletePortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('deletes portfolio if user is its investor', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId, pmId: 2 });

      let error: Error;
      try {
        await service.deletePortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toEqual(undefined);
    });

    it('deletes portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: userId });

      let error: Error;
      try {
        await service.deletePortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toEqual(undefined);
    });
  });

  describe('confirmPortfolio', () => {
    const portfolioId = 1;
    const userId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.confirmPortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to confirm the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2 });

      let error: Error;
      try {
        await service.confirmPortfolio(portfolioId, userId);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('confirms portfolio if user is its investor', async () => {
      const testPortfolio = { userId };
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(testPortfolio);
      prisma.portfolio.update = jest.fn().mockReturnValue(testPortfolio);

      const portfolio = await service.confirmPortfolio(portfolioId, userId);
      expect(portfolio).toEqual(testPortfolio);
    });
  });
});
