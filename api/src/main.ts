import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const parsedConfig = require('dotenv').config();
if (!parsedConfig.parsed || parsedConfig.error) {
  throw Error('DOTENV did not return proper config');
}

const config = parsedConfig.parsed;

async function bootstrap() {
  const { APP_PORT, WEB_URL } = config;

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: WEB_URL,
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
