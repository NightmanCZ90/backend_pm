import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getCurrentUser(user: Express.User): Promise<User> {

    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.userId }
    });

    if (!currentUser) {
      throw new NotFoundException();
    }

    return currentUser;
  }

  async updateUser(
    id: number,
    dto: UpdateUserDto
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        ...dto,
      }
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getUserToConfirm(email: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user.id;
  }
}
