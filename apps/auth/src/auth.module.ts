import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RmqModule } from '@app/common';
import * as Joi from 'joi';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthPrismaService } from './services/prisma.service';
import { LocalStrategy } from './common/strategies/local.strategy';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { AuthUsersService } from './services/auth-users.service';
import { AuthLoggerModule } from '../logger/logger.module';

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
    AuthService,
    AuthUsersService,
    AuthPrismaService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
