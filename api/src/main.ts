import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as bodyParser from 'body-parser';

const parsedConfig = require('dotenv').config();
if (!parsedConfig.parsed || parsedConfig.error) {
  throw Error('DOTENV did not return proper config');
}

const config = parsedConfig.parsed;

async function bootstrap() {
  const {API_PORT, WEB_URL} = config;

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: WEB_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  console.log('API port: ', API_PORT);
  console.log('Allowing origin: ', WEB_URL);

  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log(`Body:`, req.body);
    next();
  });


  await app.listen(API_PORT || 3000);
}

bootstrap();
