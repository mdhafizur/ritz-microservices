# Developer Notes

This document contains useful commands and instructions for working with the Ritz Microservices project.

## NestJS Commands

- Generate a shared library:
  ```bash
  nest g lib common
  ```

- Generate a RabbitMQ module in the `common` library:
  ```bash
  nest g mo rmq --project=common
  ```

- Generate a new application:
  ```bash
  nest g app app
  ```

## Prisma Commands

- Run Prisma migrations using a specific schema:
  ```bash
  npx prisma migrate dev --schema=/usr/src/app/apps/app/app.prisma
  ```

- Run Prisma migrations using the default schema:
  ```bash
  npx prisma migrate dev --schema=/usr/src/app/apps/app/prisma/schema.prisma
  ```

## Docker Commands

- Rebuild and restart the Docker containers:
  ```bash
  docker compose down && docker compose up --build -d
  ```

