import { isIn, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { ExecutionType } from "../../common/types/transactions";

@ValidatorConstraint()
export class ValidateExecution implements ValidatorConstraintInterface {
  validate(executionType: ExecutionType) {
    return isIn(
      executionType,
      [
        ExecutionType.FIFO,
        ExecutionType.LIFO,
        ExecutionType.WeightedAverage,
        ExecutionType.SpecificLots,
        ExecutionType.HighCost,
        ExecutionType.LowCost,
      ]
    );
  }

  defaultMessage() {
    return 'Invalid execution type.';
  }
}