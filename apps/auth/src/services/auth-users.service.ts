import {
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
import { AuthPrismaService } from './prisma.service';
import * as argon2 from 'argon2';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthUsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private authPrismaService: AuthPrismaService,
  ) {}

  //   async createUser(request: CreateUserRequest) {
  //     await this.validateCreateUserRequest(request);
  //     const user = await this.usersRepository.create({
  //       ...request,
  //       password: await bcrypt.hash(request.password, 10),
  //     });
  //     return user;
  //   }

  //   private async validateCreateUserRequest(request: CreateUserRequest) {
  //     let user: User;
  //     try {
  //       user = await this.usersRepository.findOne({
  //         email: request.email,
  //       });
  //     } catch (err) {}

  //     if (user) {
  //       throw new UnprocessableEntityException('Email already exists.');
  //     }
  //   }

  async validateUser(userName: string, password: string) {
    try {
      const user = await this.authPrismaService.authUser.findUnique({
        where: {
          userName: userName,
        },
      });

      if (!user) throw new ForbiddenException('Access Denied');

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credentials are not valid.');
      }

      return user;
    } catch (error) {
      this.logger.error(
        'Calling validateUser()',
        error.stack,
        AuthUsersService.name,
      );
      console.log('validateUser', error);
    }
  }

  async getUser(userName: string) {
    try {
      return this.authPrismaService.authUser.findUnique({
        where: {
          userName: userName,
        },
      });
    } catch (error) {
      this.logger.error(
        'Calling getUser()',
        error.stack,
        AuthUsersService.name,
      );
    }
  }
}
