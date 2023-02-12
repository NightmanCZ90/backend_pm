import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Role } from "../../common/types/user";
import { isRoleValid } from "../../common/utils/helpers";

@ValidatorConstraint()
export class ValidateRole implements ValidatorConstraintInterface {
  validate(role: Role) {
    return isRoleValid(role);
  }

  defaultMessage() {
    return 'Invalid user role.';
  }
}