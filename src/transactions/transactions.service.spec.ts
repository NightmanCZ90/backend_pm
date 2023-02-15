import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionType, TransactionType } from '../common/types/transactions';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createTransaction', () => {
    const userId = 1;
    const dto: CreateTransactionDto = {
      stockName: "ASTR",
      stockSector: "Technology",
      transactionTime: "2022-03-24T23:53:58.454Z",
      transactionType: TransactionType.Buy,
      numShares: 20,
      price: 22.1,
      notes: null,
      currency: "USD",
      execution: ExecutionType.FIFO,
      commissions: null,
      portfolioId: 1
    };

    it('throws an error if portfolio does not exist', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue(null);

      let error: Error;
      try {
        await service.createTransaction(userId, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to add transaction to portfolio as portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId, pmId: 3 });

      let error: Error;
      try {
        await service.createTransaction(userId, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('throws an error if user not authorized to add transaction to portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: null });

      let error: Error;
      try {
        await service.createTransaction(userId, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('returns created transaction to portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: userId });
      prisma.transaction.create = jest.fn().mockReturnValue(dto);

      const transaction = await service.createTransaction(userId, dto);
      expect(transaction).toEqual(dto);
    });

    it('returns created transaction to portfolio if user is its investor with no pm', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId, pmId: null });
      prisma.transaction.create = jest.fn().mockReturnValue(dto);

      const transaction = await service.createTransaction(userId, dto);
      expect(transaction).toEqual(dto);
    });
  });
});
