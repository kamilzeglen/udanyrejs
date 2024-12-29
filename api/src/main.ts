import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import { NestApplicationOptions} from "@nestjs/common";
import {NestExpressApplication} from "@nestjs/platform-express";
import {json, urlencoded} from "express";
import * as cookieParser from 'cookie-parser';
import {readFileSync} from 'fs';

const parsedConfig = require('dotenv').config();

if (!parsedConfig.parsed || parsedConfig.error) {
  throw Error('DOTENV did not return proper config');
}

const config = parsedConfig.parsed;

async function bootstrap() {
  const {APP_PORT, HTTPS_ENABLED, HTTPS_CERTS_DIR, DOMAINS_WHITELIST} = config;
  const appOptions: NestApplicationOptions = {};

  if (HTTPS_ENABLED === 'ENABLED' && HTTPS_CERTS_DIR) {
    appOptions.httpsOptions = {
      key: readFileSync(`${HTTPS_CERTS_DIR}/privkey.pem`),
      cert: readFileSync(`${HTTPS_CERTS_DIR}/cert.pem`),
    };
  }

  const whitelist = DOMAINS_WHITELIST?.split(',') || [];
  if (!whitelist?.length) {
    console.error('\n\n \t !!! Whitelist is empty or undefined !!! \n\n');
  }

  let origin: any = (origin: string, callback: (error: Error, isOriginAllowed: boolean) => {}) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
      return;
    }
    callback({ message: `NOT_ALLOWED`, name: 'CORS', stack: 'CORS' }, false);
    return;
  };

  console.log('Allowing domains: ', process.env.DOMAINS_WHITELIST)

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...appOptions,
  });
  app.enableCors({origin, credentials: true});
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
