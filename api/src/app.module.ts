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
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    MailerModule.forRoot({
      transport: {
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true,
        auth: {
          user: 'noreply@udanyrejs.pl',
          pass: 'J:qF:%m!8maF4V-',
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
    TerminusModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
