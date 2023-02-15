import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createTransaction(
    userId: number,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: dto.portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found.');
    }

    if (portfolio.pmId && portfolio.pmId !== userId) {
      throw new UnauthorizedException("Transaction creation is only allowed by its portfolio manager.");
    }

    if (!portfolio.pmId && portfolio.userId !== userId) {
      throw new UnauthorizedException("You don't have permission to create transaction to this portfolio.");
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        ...dto,
      }
    });

    return transaction;
  }
}
