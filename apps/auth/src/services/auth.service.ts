import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthPrismaService } from './prisma.service';
import { Response } from 'express';
import { JwtPayload, Tokens } from '../types';
import * as argon2 from 'argon2';
import { SignupDTO } from '../dtos/sign-up.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private authPrismaService: AuthPrismaService,
  ) {}
  async getHello(): Promise<any> {
    const user = await this.authPrismaService.authUser.create({
      data: {
        userName: 'Hafiz',
        password: '123456789',
      },
    });
    return user;
  }

  async signupLocal(signupDTO: SignupDTO): Promise<Tokens> {
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() +
        this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    );

    try {
      signupDTO.password = await argon2.hash(signupDTO.password);

      const createdUser = await this.authPrismaService.authUser.create({
        data: {
          ...signupDTO,
        },
      });

      await this.authPrismaService.authRefreshToken.create({
        data: {
          userId: createdUser.id,
          expiresAt: expiresAt,
        },
      });

      const tokens = await this.getTokens(createdUser.id, createdUser.userName);
      await this.updateRefreshToken(createdUser.id, tokens.refreshToken);

      // if (tokens && signupDTO.email) {
      //   const url = `http:localhost:4000/auth/verify/${'token'}`;
      //   await this.mailsService.sendEmail(
      //     signupDTO.email,
      //     'Welcome to Bit Deposit BD. Confirm your Email',
      //     './confirmation',
      //     {
      //       name: signupDTO.userName,
      //       url: url,
      //     },
      //   );
      // }

      return tokens;
    } catch (error) {
      console.log(error);
      this.logger.error('Calling signupLocal()', error.stack, AuthService.name);
      // PrismaErrorHandler(error);
    }
  }

  async loginLocal(user: any, response: Response) {
    const tokens = await this.getTokens(user.id, user.userName);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // const expires = new Date();
    // expires.setSeconds(
    //   expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    // );

    const atExpiresIn = new Date();
    atExpiresIn.setSeconds(
      atExpiresIn.getSeconds() +
        this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    );

    response.cookie('AccessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: atExpiresIn.getMilliseconds(),
    });

    const rtExpiresIn = new Date();
    rtExpiresIn.setSeconds(
      rtExpiresIn.getSeconds() +
        this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    );

    response.cookie('RefreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: rtExpiresIn.getMilliseconds(),
    });
  }

  async getTokens(userId: string, userName: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      userName: userName,
    };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(jwtPayload, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: Number(this.configService.get('ACCESS_TOKEN_EXPIRATION')),
        }),
        this.jwtService.signAsync(jwtPayload, {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: Number(this.configService.get('REFRESH_TOKEN_EXPIRATION')),
        }),
      ]);

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      this.logger.error('Calling getTokens()', error.stack, AuthService.name);
      // PrismaErrorHandler(error);
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const hash = await argon2.hash(refreshToken);

      const expiresIn = new Date();
      const expiresAt = this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRATION',
      );
      if (expiresAt) {
        const days = Math.floor(Number(expiresAt) / (3600 * 24));
        expiresIn.setDate(expiresIn.getDate() + days);
      }

      await this.authPrismaService.authRefreshToken.update({
        where: {
          userId: userId,
        },
        data: {
          token: hash,
          expiresAt: expiresIn,
        },
      });
    } catch (error) {
      this.logger.error(
        'Calling updateRefreshToken()',
        error.stack,
        AuthService.name,
      );
      // PrismaErrorHandler(error);
    }
  }
}
