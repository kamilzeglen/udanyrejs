import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as crypto from 'crypto';
import helmet from 'helmet';
import { AllExceptionsFilter } from '@core/filters/http-exception.filter';

if (!global.crypto) {
  (global as any).crypto = {
    randomUUID: crypto.randomUUID,
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const parsedConfig = require('dotenv').config();
if (!parsedConfig.parsed && !process.env.APP_PORT) {
  throw Error('DOTENV did not return proper config');
}

const config = { ...process.env, ...parsedConfig.parsed };

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const { APP_PORT, WEB_URL } = config;

  const allowedOrigins = [process.env.WEB_URL || 'http://localhost:4200'];

  const app = await NestFactory.create(AppModule);

  // Za reverse proxy (nginx-proxy-manager) jest dokładnie jeden pośredniczący
  // serwer - bez tego throttling/CORS/IP-logging liczyłyby adres proxy, nie klienta.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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
  logger.log(`APP port: ${APP_PORT}`);
  logger.log(`Allowing origin: ${WEB_URL}`);

  // Zwykłe żądania JSON/urlencoded nie noszą plików (te idą przez multer,
  // patrz limity FileInterceptor w image-file/pdf-file), więc dostają dużo
  // niższy limit niż poprzednie 50mb.
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(APP_PORT || 3000);
}

bootstrap();
