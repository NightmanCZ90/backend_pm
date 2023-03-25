import { IsEmail, IsNotEmpty } from "class-validator";

export class CheckUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}