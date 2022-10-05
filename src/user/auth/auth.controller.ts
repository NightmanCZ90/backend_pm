import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<{ accessToken: string }> {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto): Promise<{ accessToken: string }> {
    return this.authService.signin(dto);
  }
}
