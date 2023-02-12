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
});
