import { CompanyModule } from '@modules/company/company.module';
import { ShipImportExportService } from './ship-import-export.service';
import { Module } from '@nestjs/common';
import { ShipService } from './ship.service';
import { ShipController } from './ship.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ship } from '@modules/ship/ship.entity';
import { ImageFileModule } from '@modules/image-file/image-file.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ship]),
    ImageFileModule,
    UserModule,
    AuthModule,
    CompanyModule,
  ],
  controllers: [ShipController],
  providers: [ShipService, ShipImportExportService],
  exports: [ShipService, ShipImportExportService],
})
export class ShipModule {}
