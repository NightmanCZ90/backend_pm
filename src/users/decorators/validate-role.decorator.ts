import { isIn, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Role } from "../../common/types/user";

@ValidatorConstraint()
export class ValidateRole implements ValidatorConstraintInterface {
  validate(role: Role) {
    return isIn(
      role,
      [
        Role.Administrator,
        Role.PortfolioManager,
        Role.Investor
      ]
    );
  }

  defaultMessage() {
    return 'Invalid user role.';
  }
}