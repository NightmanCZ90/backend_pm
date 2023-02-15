import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionType, TransactionType } from '../common/types/transactions';
import { prismaMock } from '../prisma/prisma.mock';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prismaMock },
      ]
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
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

  describe('createTransaction', () => {
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
        await controller.createTransaction(user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it('throws an error if user not authorized to add transaction to portfolio as portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId, pmId: 3 });

      let error: Error;
      try {
        await controller.createTransaction(user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('throws an error if user not authorized to add transaction to portfolio', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: null });

      let error: Error;
      try {
        await controller.createTransaction(user, dto);
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('returns created transaction to portfolio if user is its portfolio manager', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: 2, pmId: user.userId });
      prisma.transaction.create = jest.fn().mockReturnValue(dto);

      const transaction = await controller.createTransaction(user, dto);
      expect(transaction).toEqual(dto);
    });

    it('returns created transaction to portfolio if user is its investor with no pm', async () => {
      prisma.portfolio.findUnique = jest.fn().mockReturnValue({ userId: user.userId, pmId: null });
      prisma.transaction.create = jest.fn().mockReturnValue(dto);

      const transaction = await controller.createTransaction(user, dto);
      expect(transaction).toEqual(dto);
    });
  });
});
