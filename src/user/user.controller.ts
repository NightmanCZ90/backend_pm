import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {}
