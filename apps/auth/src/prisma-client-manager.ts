/* eslint-disable prettier/prettier */
import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { Request } from 'express';
import { PrismaClient } from '../prisma/generated/client';

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  private clients: { [key: string]: PrismaClient } = {};

  getTenantId(request: Request) {
    // TODO: retrieve and return tenantId from the request object
    return String(request.body.tenantId);
  }

  getClient(request: Request): PrismaClient {
    const tenantId = this.getTenantId(request) || 'public';

    let client = this.clients[tenantId];

    if (!client) {
      const databaseUrl = process.env.DATABASE_URL?.replace('public', tenantId);
      console.log(databaseUrl);
      client = new PrismaClient({
        datasources: {
          AuthDB: {
            url: databaseUrl,
          },
        },
      });

      // setup prisma middlewares if any

      this.clients[tenantId] = client;
    }

    return client;
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}
