import { IsEmail, IsNotEmpty } from "class-validator";

export class ConfirmUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}