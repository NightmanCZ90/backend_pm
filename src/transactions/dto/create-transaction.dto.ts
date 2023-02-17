import { Transform, Type } from 'class-transformer';
import { IsDate, IsDecimal, IsISO4217CurrencyCode, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Validate } from 'class-validator';
import { ExecutionType, TransactionType } from '../../common/types/transactions';
import { ValidateExecution, ValidateTransaction } from '../decorators';

export class CreateTransactionDto {

  @IsString()
  @IsNotEmpty()
  @Length(0, 20, { message: 'Max length of stock name is 20 characters.' })
  stockName: string;

  @IsOptional()
  @Length(0, 20, { message: 'Max length of stock sector is 20 characters.' })
  stockSector: string;

  @IsDate()
  @Type(() => Date)
  transactionTime: string;

  @Validate(ValidateTransaction)
  transactionType: TransactionType;

  @Transform(({ value }) => value?.toString())
  @IsDecimal()
  numShares: number;

  @Transform(({ value }) => value?.toString())
  @IsDecimal()
  price: number;

  @IsISO4217CurrencyCode()
  currency: string;

  @Validate(ValidateExecution)
  execution: ExecutionType;

  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @IsDecimal()
  commissions: number;

  @IsOptional()
  @IsString()
  notes: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  portfolioId: number;
}