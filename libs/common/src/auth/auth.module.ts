import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  PrismaClientManager,
  PrismaClientProvider,
} from 'apps/app/src/prisma-client-manager';
import cookieParser from 'cookie-parser';
import { RmqModule } from '../rmq/rmq.module';
import { AUTH_SERVICE } from './services';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  // providers: [PrismaClientManager, PrismaClientProvider],
  exports: [RmqModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
