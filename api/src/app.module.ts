import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@modules/user/user.module';
import { OfferModule } from '@modules/offer/offer.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RoleModule } from '@modules/role/role.module';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { CompanyModule } from '@modules/company/company.module';
import { ImageFileModule } from '@modules/image-file/image-file.module';
import { PdfFileModule } from '@modules/pdf-file/pdf-file.module';
import { ShipModule } from '@modules/ship/ship.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategoryModule } from '@modules/category/category.module';
import { DestinationModule } from '@modules/destination/destination.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailModule } from '@modules/email/email.module';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from '@modules/log/log.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from '@core/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      // Zbiera wszystkie brakujące/błędne zmienne naraz zamiast zatrzymywać
      // się na pierwszej - jeden nieudany deploy pokazuje cały problem,
      // nie tylko jego pierwszy objaw.
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
    ]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST'),
          port: configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USERNAME'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          entities: ['dist/**/*.entity.js'],
          synchronize: configService.get('DB_SYNC') === 'true',
        } as TypeOrmModuleAsyncOptions;
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: configService.get('MAIL_SECURE') === 'true',
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <noreplay@udanyrejs.pl>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    ServeStaticModule.forRootAsync({
      useFactory: () => [
        {
          rootPath: process.env.OFFERS_IMAGES_PATH,
          serveRoot: '/offers/images',
        },
        {
          rootPath: process.env.SHIPS_IMAGES_PATH,
          serveRoot: '/ships/images',
        },
        {
          rootPath: process.env.COMPANIES_IMAGES_PATH,
          serveRoot: '/companies/images',
        },
      ],
    }),
    TerminusModule,
    RoleModule,
    UserModule,
    AuthModule,
    OfferModule,
    CompanyModule,
    ImageFileModule,
    CategoryModule,
    DestinationModule,
    PdfFileModule,
    ShipModule,
    EmailModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
