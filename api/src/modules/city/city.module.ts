import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '@modules/city/city.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { DestinationModule } from '@modules/destination/destination.module';
import { CityImportExportService } from './city-import-export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
    UserModule,
    AuthModule,
    DestinationModule,
  ],
  controllers: [CityController],
  providers: [CityService, CityImportExportService],
  exports: [CityService, CityImportExportService],
})
export class CityModule {}
