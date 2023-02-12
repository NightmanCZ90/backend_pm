import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
  createPortfolio(
    @Body() dto: CreatePortfolioDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.createPortfolio(user.userId, dto);
  }
}
