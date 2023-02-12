import { Injectable, NotFoundException } from '@nestjs/common';
import { Portfolio } from '@prisma/client';
import { UsersPortfolios } from '../common/types/portfolios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dtos';

@Injectable()
export class PortfoliosService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createPortfolio(userId: number, dto: CreatePortfolioDto): Promise<Portfolio> {
    const { name, description, url, color, investorId } = dto;

    if (investorId) {
      const user = await this.prisma.user.findUnique({
        where: { id: investorId }
      })

      if (!user) {
        throw new NotFoundException('User with this id does not exist.');
      }
    }

    const portfolio = await this.prisma.portfolio.create({
      data: {
        name,
        description,
        url,
        color,
        userId: investorId || userId,
        pmId: investorId ? userId : null,
        confirmed: !Boolean(investorId),
      },
    });

    return portfolio;
  }

  async getUsersPortfolios(userId: number): Promise<UsersPortfolios> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: {
        OR: [
          { userId },
          { pmId: userId },
        ],
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
        portfolioManager: true,
        transactions: true,
      }
    });

    const managed = portfolios.filter(portfolio => portfolio.pmId && portfolio.pmId !== userId);
    const managing = portfolios.filter(portfolio => portfolio.pmId === userId);
    const personal = portfolios.filter(portfolio => portfolio.userId === userId && !portfolio.pmId);

    return { managed, managing, personal };
  }
}
