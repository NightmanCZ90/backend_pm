import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto';

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
      throw new ForbiddenException("Transaction creation is only allowed by its portfolio manager.");
    }

    if (!portfolio.pmId && portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to create transaction to this portfolio.");
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        ...dto,
      }
    });

    return transaction;
  }

  async updateTransaction(
    transactionId: number,
    userId: number,
    dto: UpdateTransactionDto,
  ) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: dto.portfolioId },
      include: { transactions: { where: { id: transactionId } } }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found.');
    }

    if (!portfolio.transactions || portfolio.transactions?.length === 0) {
      throw new NotFoundException('This transaction does not belong to this selected portfolio.');
    }

    if (portfolio.pmId && portfolio.pmId !== userId) {
      throw new ForbiddenException("Transaction update is only allowed by its portfolio manager.");
    }

    if (!portfolio.pmId && portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to update transaction to this portfolio.");
    }

    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        updatedAt: new Date(),
        ...dto,
      }
    });

    return transaction;
  }

  async deleteTransaction(
    transactionId: number,
    userId: number,
  ): Promise<void> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        portfolio: {
          select: {
            userId: true,
            pmId: true,
          }
        }
      }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    if (transaction.portfolio.pmId && transaction.portfolio.pmId !== userId) {
      throw new ForbiddenException("Transaction deletion is only allowed by its portfolio manager.");
    }

    if (!transaction.portfolio.pmId && transaction.portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to delete this transaction.");
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId }
    });
  }
}
