import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { JwtGuard } from '../common/guards';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { ConfirmUserDto, UpdateUserDto } from './dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // TODO: Guard for Admin
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  getCurrentUser(
    @CurrentUser() user: Express.User
  ) {
    return this.usersService.getCurrentUser(user);
  }

  // TODO: Guard for Admin and Current user
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getUserById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: Express.User
  ) {
    if (id !== user.userId) {
      throw new UnauthorizedException('Cannot update another user.');
    }
    return this.usersService.updateUser(id, dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  getUserToConfirm(
    @Body() dto: ConfirmUserDto
  ) {
    return this.usersService.getUserToConfirm(dto.email);
  }
}
