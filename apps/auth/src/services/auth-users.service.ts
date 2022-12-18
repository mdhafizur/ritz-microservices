import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
import { AuthPrismaService } from './prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthUsersService {
  constructor(private authPrismaService: AuthPrismaService) {}

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
      console.log('validateUser', error);
    }
  }

  async getUser(userName: string) {
    return this.authPrismaService.authUser.findUnique({
      where: {
        userName: userName,
      },
    });
  }
}
