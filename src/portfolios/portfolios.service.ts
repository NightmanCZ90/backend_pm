import { Injectable, NotFoundException } from '@nestjs/common';
import { Portfolio } from '@prisma/client';
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
}
