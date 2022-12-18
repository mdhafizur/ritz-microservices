```
$ nest g lib common
$ nest g mo rmq --project=common
$ nest g app auth

$ npx prisma migrate dev --schema=/usr/src/app/apps/auth/auth.prisma
$ npx prisma migrate dev --schema=/usr/src/app/apps/auth/prisma/schema.prisma

$ docker compose down && docker compose up --build -d
```