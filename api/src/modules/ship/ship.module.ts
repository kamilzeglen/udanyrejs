import {Module} from '@nestjs/common';
import {ShipService} from './ship.service';
import {ShipController} from './ship.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Ship} from "@modules/ship/ship.entity";
import {CompanyModule} from "@modules/company/company.module";

@Module({
  imports: [TypeOrmModule.forFeature([Ship]), CompanyModule],
  controllers: [ShipController],
  providers: [ShipService],
  exports: [ShipService],
})
export class ShipModule {
}
