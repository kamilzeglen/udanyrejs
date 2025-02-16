import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import * as crypto from 'crypto';

if (!global.crypto) {
  (global as any).crypto = {
    randomUUID: crypto.randomUUID,
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const parsedConfig = require('dotenv').config();
if (!parsedConfig.parsed || parsedConfig.error) {
  throw Error('DOTENV did not return proper config');
}

const config = parsedConfig.parsed;

async function bootstrap() {
  const { APP_PORT, WEB_URL } = config;

  const allowedOrigins = [
    process.env.WEB_URL || 'http://localhost:4200',
    process.env.SCRAPPER_URL || 'http://localhost:3001',
  ];

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  console.log('APP port: ', APP_PORT);
  console.log('Allowing origin: ', WEB_URL);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(APP_PORT || 3000);
}

bootstrap();
