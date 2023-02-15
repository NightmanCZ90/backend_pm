import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { JwtGuard } from '../common/guards';
import { CreateTransactionDto } from './dto';
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
}
