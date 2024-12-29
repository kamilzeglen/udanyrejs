import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestApplicationOptions} from "@nestjs/common";
import {NestExpressApplication} from "@nestjs/platform-express";
import {json, urlencoded} from "express";
import * as cookieParser from 'cookie-parser';

const parsedConfig = require('dotenv').config();

if (!parsedConfig.parsed || parsedConfig.error) {
  throw Error('DOTENV did not return proper config');
}

const config = parsedConfig.parsed;

async function bootstrap() {
  const {APP_PORT, HTTPS_ENABLED, HTTPS_CERTS_DIR, WEB_URL} = config;
  const appOptions: NestApplicationOptions = {};

  // if (HTTPS_ENABLED === 'ENABLED' && HTTPS_CERTS_DIR) {
  //   appOptions.httpsOptions = {
  //     key: readFileSync(`${HTTPS_CERTS_DIR}/privkey.pem`),
  //     cert: readFileSync(`${HTTPS_CERTS_DIR}/cert.pem`),
  //   };
  // }

  console.log('Allowing Cors: ', WEB_URL)

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...appOptions,
  });
  app.enableCors({
    origin: process.env.WEB_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.use(cookieParser());
  app.use(json({limit: '50mb'}));
  app.use(
    urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit: 5000,
    }),
  );

  const server = await app.listen(APP_PORT || 3000);
}
bootstrap();
