import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessTokenStrategy, RefreshTokenStrategy } from './common/strategies';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
  ],
  providers: [
    AccessTokenStrategy,
    RefreshTokenStrategy
  ]
})
export class AppModule {}
