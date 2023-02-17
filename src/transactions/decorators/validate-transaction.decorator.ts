import { isIn, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { TransactionType } from "../../common/types/transactions";

@ValidatorConstraint()
export class ValidateTransaction implements ValidatorConstraintInterface {
  validate(transactionType: TransactionType) {
    return isIn(
      transactionType,
      [
        TransactionType.Buy,
        TransactionType.Sell,
        TransactionType.BuyToCover,
        TransactionType.SellShort,
        TransactionType.DRIP,
        TransactionType.Dividends,
        TransactionType.Split,
      ]
    );
  }

  defaultMessage() {
    return 'Invalid transaction type.';
  }
}