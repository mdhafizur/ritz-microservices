# Ritz Microservices

![Project Logo](https://via.placeholder.com/350x100?text=Ritz+Microservices)

A scalable, modular microservices application built with [NestJS](https://nestjs.com/), leveraging RabbitMQ, PostgreSQL, Redis, and Kafka for robust distributed systems.

---

## Table of Contents
- [Ritz Microservices](#ritz-microservices)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Quick Start](#quick-start)
    - [1. Clone and Install](#1-clone-and-install)
    - [2. Environment Variables](#2-environment-variables)
    - [3. Start with Docker Compose](#3-start-with-docker-compose)
    - [4. Access](#4-access)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
  - [API Documentation](#api-documentation)
  - [Testing](#testing)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)
  - [License](#license)
  - [Author](#author)

---

## Features
- **Microservices Architecture** with NestJS
- **RabbitMQ** for message-based communication
- **PostgreSQL** as the main database
- **Redis** for caching/session management
- **Kafka** for event streaming
- **JWT Authentication** (access/refresh tokens)
- **Centralized Logging** with Winston
- **Swagger API Docs**
- **Dockerized Deployment**

## Architecture
- **apps/app/**: Main application service
- **libs/common/**: Shared modules and code
- **compose/**: Docker Compose configs for databases and brokers
- **data/**: Kafka/Zookeeper data
- **redis/**: Redis config
- **secrets/**: SSL certificates

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-repo/ritz-microservices.git
cd ritz-microservices
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and edit as needed. (See [Environment Variables](#environment-variables))

### 3. Start with Docker Compose
```bash
docker-compose up --build -d
```

### 4. Access
- App: https://localhost:3001
- Swagger Docs: https://localhost:3001/api/docs

## Environment Variables
| Variable                | Description                        |
|-------------------------|------------------------------------|
| DATABASE_URL            | PostgreSQL connection string        |
| REDIS_URL               | Redis connection string             |
| RABBITMQ_URL            | RabbitMQ connection string          |
| KAFKA_BROKER            | Kafka broker address                |
| JWT_SECRET              | JWT secret key                     |
| ...                     | ...                                |

> See `.env.example` for a full list and details.

## Project Structure
```
apps/         # Main app and microservices
libs/         # Shared libraries
compose/      # Docker Compose configs
redis/        # Redis config
secrets/      # SSL certs
```

## Available Scripts
| Script                | Description                         |
|-----------------------|-------------------------------------|
| npm run start:dev     | Start in development mode           |
| npm run build         | Build the application               |
| npm run test          | Run unit tests                      |
| npm run test:e2e      | Run end-to-end tests                |
| npm run test:cov      | Test coverage report                |
| npm run lint          | Lint codebase                       |

## API Documentation
Swagger UI: [https://localhost:3001/api/docs](https://localhost:3001/api/docs)

## Testing
```bash
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
npm run test:cov   # Coverage
```

## Troubleshooting
- **Ports in use**: Ensure 3001, 5432, 6379, 5672, 9092 are free.
- **SSL Issues**: Check `secrets/` for valid `cert.pem` and `key.pem`.
- **Database**: Confirm PostgreSQL is running and accessible.

## Contributing
1. Fork the repo
2. Create a feature branch
3. Commit and push
4. Open a pull request

## License
MIT

## Author
Md Hafizur Rahman

