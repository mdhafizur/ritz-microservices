// https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
// https://github.com/winstonjs/winston-daily-rotate-file#readme
// https://github.com/gremo/nest-winston#readme

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info) => {
  return info.level === 'info' ? info : false;
});

const debugFilter = winston.format((info) => {
  return info.level === 'debug' ? info : false;
});

const transports = {
  console: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({
        all: true,
        colors: {
          info: 'blue',
          debug: 'yellow',
          error: 'red',
        },
      }),
      nestWinstonModuleUtilities.format.nestLike('BitDeposit', {
        prettyPrint: true,
      }),
    ),
  }),
  infoFile: new winston.transports.DailyRotateFile({
    level: 'info',
    filename: 'info-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    dirname: 'apps/auth/logs',
    format: winston.format.combine(infoFilter()),
  }),
  debugFile: new winston.transports.DailyRotateFile({
    level: 'debug',
    filename: 'debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    dirname: 'apps/auth/logs',
    format: winston.format.combine(debugFilter()),
  }),
  errorFile: new winston.transports.DailyRotateFile({
    level: 'error',
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    dirname: 'apps/auth/logs',
    format: winston.format.combine(errorFilter()),
  }),
};

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        levels: logLevels,
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
          }),
          winston.format.json(),
          winston.format.ms(),
          winston.format.align(),
          winston.format.printf(
            (info) =>
              `[${info.timestamp}] ${info.level} (${
                info.context ? info.context : info.stack
              }): ${info.stack ? info.stack : info.message}`,
          ),
        ),
        transports: [
          transports.console,
          transports.infoFile,
          transports.debugFile,
          transports.errorFile,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthLoggerModule {}
