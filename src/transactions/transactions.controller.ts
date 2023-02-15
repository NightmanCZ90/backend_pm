import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';

@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionsController { }
