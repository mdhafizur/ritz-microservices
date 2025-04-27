/* eslint-disable prettier/prettier */
import {
  FactoryProvider,
  Injectable,
  OnModuleDestroy,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Request } from 'express';
import { PrismaClient } from '../prisma/generated/client';

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  private clients: { [key: string]: PrismaClient } = {};

  async getResourcesByTenantCode(tenantCode: string) {
    const mainClient = new PrismaClient();
    return await mainClient.appTenantResources.findFirstOrThrow({
      where: {
        appTenant: {
          code: tenantCode,
        },
      },
    });
  }

  getTenantCode(request: Request) {
    return request.headers.tenantcode != undefined
      ? String(request.headers.tenantcode)
      : null;
  }

  async getClient(request: Request): Promise<PrismaClient> {
    const tenantCode = 'public';

    let client = this.clients[tenantCode];

    if (!client) {
      const databaseUrl = process.env.DATABASE_URL?.replace(
        'public',
        tenantCode,
      );

      // if (tenantCode != 'undefined') {
      //   const resources: any = await this.getResourcesByTenantCode(tenantCode);
      //   if (resources.connectionJSON) {
      //     // databaseUrl = 'postgresql://ritz_master:ritz_master@localhost:7655/ritz_master?schema=public';
      //     databaseUrl = `postgresql://${resources.connectionJSON.username}:${resources.connectionJSON.password}@${resources.connectionJSON.host}:${resources.connectionJSON.port}/${resources.connectionJSON.database}?schema=${resources.connectionJSON.schema}`;
      //   }
      // }

      console.log(databaseUrl);
      client = new PrismaClient({
        datasources: {
          MasterDB: {
            url: databaseUrl,
          },
        },
      });

      // setup prisma middlewares if any

      this.clients[tenantCode] = client;
    }

    return client;
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}

export const PrismaClientProvider: FactoryProvider<PrismaClient> = {
  provide: PrismaClient,
  scope: Scope.REQUEST,
  inject: [REQUEST, PrismaClientManager],
  useFactory: (request: Request, manager: PrismaClientManager) =>
    manager.getClient(request),
};
