import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // TODO: Guard for Admin
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // TODO: Guard for Admin and Current user
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getUserById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getUserById(id);
  }
}
