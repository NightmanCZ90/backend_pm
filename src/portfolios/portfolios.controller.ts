import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { JwtGuard } from '../common/guards';
import { CreatePortfolioDto } from './dtos';
import { PortfoliosService } from './portfolios.service';

@UseGuards(JwtGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
  ) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createPortfolio(
    @Body() dto: CreatePortfolioDto,
    @CurrentUser() user: Express.User,
  ) {
    if (user.userId === dto.investorId) {
      throw new BadRequestException('Cannot create managed portfolio to yourself.');
    }
    return this.portfoliosService.createPortfolio(user.userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getUsersPortfolios(
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.getUsersPortfolios(user.userId);
  }
}