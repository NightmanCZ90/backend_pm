import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dtos';
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
      expect(error).toBeInstanceOf(ForbiddenException);
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

  describe('updatePortfolio', () => {
    const portfolioId = 1;
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
        await controller.updatePortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to update the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 2 });

      let error: Error;
      try {
        await controller.updatePortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('updates portfolio if user is its investor', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId, pmId: 2 });
      prisma.portfolio.update = jest.fn().mockReturnValue(dto);

      const portfolio = await controller.updatePortfolio(portfolioId, user, dto);
      expect(portfolio).toEqual(dto);
    });

    it('updates portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: user.userId });
      prisma.portfolio.update = jest.fn().mockReturnValue(dto);

      const portfolio = await controller.updatePortfolio(portfolioId, user, dto);
      expect(portfolio).toEqual(dto);
    });
  });

  describe('deletePortfolio', () => {
    const portfolioId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.deletePortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to delete the portfolio with no pm', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: null });

      let error: Error;
      try {
        await controller.deletePortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('throws an error if user not authorized to delete the portfolio with pm', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: 3 });

      let error: Error;
      try {
        await controller.deletePortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('deletes portfolio if user is its investor with no pm', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId, pmId: null });

      let error: Error;
      try {
        await controller.deletePortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toEqual(undefined);
    });

    it('deletes portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: user.userId });

      let error: Error;
      try {
        await controller.deletePortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toEqual(undefined);
    });
  });

  describe('confirmPortfolio', () => {
    const portfolioId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.confirmPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to confirm the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2 });

      let error: Error;
      try {
        await controller.confirmPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('confirms portfolio if user is its investor', async () => {
      const testPortfolio = { userId: user.userId };

      prisma.portfolio.findUnique = jest.fn().mockReturnValue(testPortfolio);
      prisma.portfolio.update = jest.fn().mockReturnValue(testPortfolio);

      const portfolio = await controller.confirmPortfolio(portfolioId, user);
      expect(portfolio).toEqual(testPortfolio);
    });
  });

  describe('linkPortfolio', () => {
    const portfolioId = 1;
    const dto = {
      email: 'test1@test.com'
    };

    it('throws an error if investor not found', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue(null);
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: null, pmId: null });

      let error: Error;
      try {
        await controller.linkPortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if linking to yourself', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue({ id: 1 });
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 1, pmId: null });

      let error: Error;
      try {
        await controller.linkPortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(BadRequestException);
    });

    it('throws an error if portfolio not found', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue({ id: 2 });
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.linkPortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to link the portfolio', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValue({ id: 2 });
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 3 });

      let error: Error;
      try {
        await controller.linkPortfolio(portfolioId, user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('returns linked portfolio', async () => {
      const testPortfolio = { userId: 2, pmId: user.userId };

      prisma.user.findUnique = jest.fn().mockReturnValue({ id: 2 });
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId });
      prisma.portfolio.update = jest.fn().mockReturnValue(testPortfolio);

      const portfolio = await controller.linkPortfolio(portfolioId, user, dto);
      expect(portfolio).toEqual(testPortfolio);
    });
  });

  describe('unlinkPortfolio', () => {
    const portfolioId = 1;

    it('throws an error if portfolio not found', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await controller.unlinkPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to unlink the portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ pmId: 3 });

      let error: Error;
      try {
        await controller.unlinkPortfolio(portfolioId, user);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('returns linked portfolio', async () => {
      const testPortfolio = { userId: user.userId, pmId: null };

      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ pmId: user.userId });
      prisma.portfolio.update = jest.fn().mockReturnValue(testPortfolio);

      const portfolio = await controller.unlinkPortfolio(portfolioId, user);
      expect(portfolio).toEqual(testPortfolio);
    });
  });
});
