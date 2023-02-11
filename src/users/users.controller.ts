import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
}
