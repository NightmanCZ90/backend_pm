import { IsEmail, IsNotEmpty } from "class-validator";

export class LinkPortfolioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}