import { FactoryProvider, Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RmqModule } from '@app/common';
import * as Joi from 'joi';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './common/strategies/local.strategy';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { AuthUsersService } from './services/auth-users.service';
import { AuthLoggerModule } from '../logger/logger.module';
import { APP_GUARD, REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AccessTokenGuard } from './common/guards';
import { PrismaClientManager } from './prisma-client-manager';
import { PrismaClient } from '../prisma/generated/client';

const prismaClientProvider: FactoryProvider<PrismaClient> = {
  provide: PrismaClient,
  scope: Scope.REQUEST,
  inject: [REQUEST, PrismaClientManager],
  useFactory: (request: Request, manager: PrismaClientManager) =>
    manager.getClient(request),
};

@Module({
  imports: [
    RmqModule,
    AuthLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    JwtModule.register({}),
    // JwtModule.registerAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
    //     signOptions: {
    //       expiresIn: `${configService.get('ACCESS_TOKEN_EXPIRATION')}s`,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaClientManager,
    prismaClientProvider,
    AuthService,
    AuthUsersService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AuthModule {}
