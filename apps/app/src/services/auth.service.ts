import {
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtPayload, Tokens } from '../types';
import * as argon2 from 'argon2';
import { SignupDTO } from '../dto/sign-up.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaClient } from 'apps/app/prisma/generated/client';
import { SignInDTO } from '../dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private appPrismaService: PrismaClient,
  ) {}
  async getHello(data: any): Promise<any> {
    // return await this.appPrismaService.appUser.create({
    //   data: {
    //     userName: data.userName,
    //     password: data.password,
    //   },
    // });
    return 'hello';
  }

  async signupLocal(signupDTO: SignupDTO): Promise<Tokens> {
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() +
        this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    );

    try {
      signupDTO.password = await argon2.hash(signupDTO.password);

      const createdUser = await this.appPrismaService.appUser.create({
        data: {
          ...signupDTO,
        },
      });

      await this.appPrismaService.appRefreshToken.create({
        data: {
          userUuid: createdUser.uuid,
          expiresAt: expiresAt,
        },
      });

      const tokens = await this.getTokens(createdUser);
      await this.updateRefreshTokenHash(tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.log(error);
      this.logger.error('Calling signupLocal()', error.stack, AuthService.name);
      // PrismaErrorHandler(error);
    }
  }

  async signinLocal(
    signInDTO: SignInDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    try {
      const user = await this.appPrismaService.appUser.findUnique({
        where: {
          userName: signInDTO.userName,
        },
        include: {
          appGroupUser: {
            include: {
              appGroup: true,
            },
          },
        },
      });

      if (!user) throw new ForbiddenException('Access Denied');

      const userAuthGroups = user.appGroupUser.map(
        (group) => group.appGroup.name,
      );

      if (signInDTO.userType && !userAuthGroups.includes(signInDTO.userType)) {
        this.logger.error(
          'Calling signinLocal()',
          'signInDTO.userType not found',
          AuthService.name,
        );
        throw new ForbiddenException('Access Denied');
      }

      const isPasswordValid = await argon2.verify(
        user.password,
        signInDTO.password,
      );

      if (!isPasswordValid) throw new ForbiddenException('Access Denied');

      const tokens = await this.getTokens(user);

      await this.updateRefreshTokenHash(tokens.refreshToken);

      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
      });

      response.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
      });

      return tokens;
    } catch (error) {
      this.logger.error('Calling signinLocal()', error.stack, AuthService.name);
    }
  }

  async getTokens(userData: any): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userData.uuid,
      userName: userData.userName,
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

  async updateRefreshTokenHash(refreshToken: string): Promise<void> {
    try {
      const decodedJwtRefreshToken: any = this.jwtService.decode(refreshToken);

      const hashedRefreshToken = await argon2.hash(refreshToken);

      await this.appPrismaService.appRefreshToken.upsert({
        where: {
          userUuid: decodedJwtRefreshToken.sub,
        },
        create: {
          token: hashedRefreshToken,
          expiresAt: new Date(decodedJwtRefreshToken.exp * 1000),
          userUuid: decodedJwtRefreshToken.sub,
        },
        update: {
          token: hashedRefreshToken,
          expiresAt: new Date(decodedJwtRefreshToken.exp * 1000),
        },
      });
    } catch (error) {
      this.logger.error(
        'Calling updateRefreshTokenHash()',
        error.stack,
        AuthService.name,
      );
      console.log(error);
      // PrismaErrorHandler(error);
    }
  }

  async getUser(userUuid) {
    return this.appPrismaService.appUser.findUniqueOrThrow({
      where: {
        uuid: userUuid,
      },
    });
  }
}
