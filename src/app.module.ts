import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middlewares';
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
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      LoggerMiddleware, // TODO: disable in production
    ).forRoutes('*');
  }
}
