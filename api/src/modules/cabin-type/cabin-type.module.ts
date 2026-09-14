import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CabinTypeService } from './cabin-type.service';
import { CabinTypeController } from './cabin-type.controller';
import { CabinType } from './cabin-type.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CompanyModule } from '@modules/company/company.module';
import { CabinTypeImportExportService } from './cabin-type-import-export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CabinType]),
    UserModule,
    AuthModule,
    CompanyModule,
  ],
  controllers: [CabinTypeController],
  providers: [CabinTypeService, CabinTypeImportExportService],
  exports: [CabinTypeService, CabinTypeImportExportService],
})
export class CabinTypeModule {}
