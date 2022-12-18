import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as AuthClient } from 'apps/auth/prisma/generated/client';

@Injectable()
export class AuthPrismaService extends AuthClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
