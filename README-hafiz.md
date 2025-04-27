```
$ nest g lib common
$ nest g mo rmq --project=common
$ nest g app app

$ npx prisma migrate dev --schema=/usr/src/app/apps/app/app.prisma
$ npx prisma migrate dev --schema=/usr/src/app/apps/app/prisma/schema.prisma

$ docker compose down && docker compose up --build -d
```