import { IsOptional, IsString, Length, Validate } from 'class-validator';
import { Role } from '../../common/types/user';
import { ValidateRole } from '../decorators';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(0, 40, { message: 'Max length of first name is 40 characters.' })
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(0, 40, { message: 'Max length of last name is 40 characters.' })
  lastName: string;

  @Validate(ValidateRole)
  role: Role;
}