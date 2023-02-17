import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { JwtGuard } from '../common/guards';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dtos';
import { LinkPortfolioDto } from './dtos';
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getPortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.getPortfolio(id, user.userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updatePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfoliosService.updatePortfolio(id, user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.deletePortfolio(id, user.userId);
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirmPortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.confirmPortfolio(id, user.userId);
  }

  @Patch(':id/link')
  @HttpCode(HttpStatus.OK)
  linkPortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
    @Body() dto: LinkPortfolioDto,
  ) {
    return this.portfoliosService.linkPortfolio(id, user.userId, dto.email);
  }

  @Patch(':id/unlink')
  @HttpCode(HttpStatus.OK)
  unlinkPortfolio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.portfoliosService.unlinkPortfolio(id, user.userId);
  }
}
