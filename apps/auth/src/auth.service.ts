import { Injectable } from '@nestjs/common';
import { AuthPrismaService } from './services/prisma.service';

@Injectable()
export class AuthService {
  constructor(private authPrismaService: AuthPrismaService) {}
  async getHello(): Promise<any> {
    const user = await this.authPrismaService.authUser.create({
      data: {
        userName: 'Hafiz',
        password: '123456789',
      },
    });
    return user;
  }
}
