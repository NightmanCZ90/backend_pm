import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middlewares';
import { AccessTokenStrategy, RefreshTokenStrategy } from './common/strategies';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { TransactionsModule } from './transactions/transactions.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    PortfoliosModule,
    TransactionsModule,
  ],
  providers: [
    AccessTokenStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      })
    }
  ]
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      LoggerMiddleware, // TODO: disable in production
    ).forRoutes('*');
  }
}
