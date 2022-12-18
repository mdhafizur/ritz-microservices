import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthPrismaService } from './services/prisma.service';
import { Response } from 'express';
import { JwtPayload, Tokens } from './types';
import * as argon2 from 'argon2';
import { SignupDTO } from './dtos/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
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
    const expiresAfter = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const expiresIn = new Date();

    if (expiresAfter.endsWith('d')) {
      const days = Number(expiresAfter.substring(0, expiresAfter.length - 1));
      expiresIn.setDate(expiresIn.getDate() + days);
    }

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
          expiresAt: expiresIn,
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
      // this.logger.error(
      //   'Calling signupLocal()',
      //   error.stack,
      //   AuthenticationsService.name,
      // );
      // PrismaErrorHandler(error);
    }
  }

  async login(user: any, response: Response) {
    const tokens = await this.getTokens(user.id, user.userName);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // let expires = new Date();
    // expires.setSeconds(
    //   expires.getSeconds() + this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    // );

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    response.cookie('AccessToken', tokens.accessToken, {
      httpOnly: true,
      expires,
    });

    // expires = new Date();
    // expires.setSeconds(
    //   expires.getSeconds() + this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    // );

    response.cookie('RefreshToken', tokens.refreshToken, {
      httpOnly: true,
      expires,
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
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
        }),
        this.jwtService.signAsync(jwtPayload, {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
        }),
      ]);

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      // this.logger.error(
      //   'Calling getTokens()',
      //   error.stack,
      //   AuthenticationsService.name,
      // );
      // PrismaErrorHandler(error);
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const hash = await argon2.hash(refreshToken);

      await this.authPrismaService.authRefreshToken.update({
        where: {
          userId: userId,
        },
        data: {
          token: hash,
        },
      });
    } catch (error) {
      // this.logger.error(
      //   'Calling updateRefreshToken()',
      //   error.stack,
      //   AuthenticationsService.name,
      // );
      // PrismaErrorHandler(error);
    }
  }
}
