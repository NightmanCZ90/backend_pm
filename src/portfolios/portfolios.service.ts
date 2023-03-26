import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Portfolio } from '@prisma/client';
import { ExtendedPortfolio, UsersPortfolios } from '../common/types/portfolios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dtos';

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
      throw new ForbiddenException("You don't have permission to receive this portfolio.");
    }

    return portfolio;
  }

  async updatePortfolio(
    portfolioId: number,
    userId: number,
    dto: UpdatePortfolioDto,
  ): Promise<ExtendedPortfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException();
    }

    if (portfolio.userId !== userId && portfolio.pmId !== userId) {
      throw new ForbiddenException("You don't have permission to update this portfolio.");
    }

    const updatedPortfolio = await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        updatedAt: new Date(),
        ...dto,
      },
      include: {
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    return updatedPortfolio;
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

    if (portfolio.pmId && portfolio.pmId !== userId) {
      throw new ForbiddenException("Portfolio deletion is only allowed by its portfolio manager.");
    }

    if (!portfolio.pmId && portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to delete this portfolio.");
    }

    await this.prisma.portfolio.delete({
      where: { id: portfolioId }
    });
  }

  async confirmPortfolio(
    portfolioId: number,
    userId: number,
  ): Promise<ExtendedPortfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException();
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to confirm this portfolio.");
    }

    const confirmedPortfolio = await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        updatedAt: new Date(),
        confirmed: true,
      },
      include: {
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    return confirmedPortfolio;
  }

  async linkPortfolio(
    portfolioId: number,
    userId: number,
    email: string,
  ): Promise<ExtendedPortfolio> {
    const investor = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!investor) {
      throw new NotFoundException('User with this email does not exist.');
    }

    if (userId === investor.id) {
      throw new BadRequestException('Cannot link portfolio to yourself.');
    }

    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio with this id does not exist.');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException("You don't have permission to link this portfolio.");
    }

    const linkedPortfolio = await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        updatedAt: new Date(),
        confirmed: false,
        userId: investor.id,
        pmId: userId,
      },
      include: {
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    return linkedPortfolio;
  }

  async unlinkPortfolio(
    portfolioId: number,
    userId: number,
  ): Promise<ExtendedPortfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio with this id does not exist.');
    }

    if (portfolio.pmId !== userId) {
      throw new ForbiddenException("You don't have permission to unlink this portfolio.");
    }

    const unlinkedPortfolio = await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        updatedAt: new Date(),
        confirmed: true,
        userId: userId,
        pmId: null,
      },
      include: {
        user: { select: userWithoutPassword },
        portfolioManager: { select: userWithoutPassword },
        transactions: true,
      }
    });

    return unlinkedPortfolio;
  }
}
