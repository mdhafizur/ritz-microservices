import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule, RmqModule } from '@app/common';
import * as Joi from 'joi';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './common/strategies/local.strategy';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { AuthUsersService } from './services/auth-users.service';
import { AppLoggerModule } from '../logger/logger.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards';
import {
  PrismaClientManager,
  PrismaClientProvider,
} from './prisma-client-manager';
import { AppController } from './controllers/app.controller';

@Module({
  imports: [
    RmqModule,
    AppLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
      envFilePath: './apps/app/.env',
    }),
    JwtModule.register({}),
    AuthModule,
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
  controllers: [AppController, AuthController],
  providers: [
    PrismaClientManager,
    PrismaClientProvider,
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
export class AppModule {}
