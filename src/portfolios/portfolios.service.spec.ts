import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dtos';
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
      color: 'FFF',
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
});
