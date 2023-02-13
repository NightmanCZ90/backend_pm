import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Portfolio } from '@prisma/client';
import { ExtendedPortfolio, UsersPortfolios } from '../common/types/portfolios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dtos';

const userWithoutPassword = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
}

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
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    const managed = portfolios.filter(portfolio => portfolio.pmId && portfolio.pmId !== userId);
    const managing = portfolios.filter(portfolio => portfolio.pmId === userId);
    const personal = portfolios.filter(portfolio => portfolio.userId === userId && !portfolio.pmId);

    return { managed, managing, personal };
  }

  async getPortfolio(
    portfolioId: number,
    userId: number,
  ): Promise<ExtendedPortfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    if (!portfolio) {
      throw new NotFoundException();
    }

    if (portfolio.userId !== userId && portfolio.pmId !== userId) {
      throw new UnauthorizedException("You don't have permission to receive this portfolio.");
    }

    return portfolio;
  }

  async deletePortfolio(
    portfolioId: number,
    userId: number,
  ): Promise<void> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException();
    }

    if (portfolio.userId !== userId && portfolio.pmId !== userId) {
      throw new UnauthorizedException("You don't have permission to delete this portfolio.");
    }

    await this.prisma.portfolio.delete({
      where: { id: portfolioId }
    });
  }
}
