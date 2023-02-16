import { Body, Controller, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { JwtGuard } from '../common/guards';
import { CreateTransactionDto, UpdateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTransaction(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(user.userId, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(id, user.userId, dto);
  }
}
