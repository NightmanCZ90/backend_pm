import { IsHexColor, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class UpdatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: 'Max length of portfolio name is 20 chars.' })
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 240, { message: 'Max length of portfolio description is 240 chars.' })
  description: string;

  @IsString()
  @Length(6, 6, { message: 'Portfolio color must be 6 characters long.' })
  @IsHexColor()
  color: string;

  @IsString()
  @IsOptional()
  url: string;
}