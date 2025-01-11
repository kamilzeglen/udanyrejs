import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {City} from "@modules/city/city.entity";
import {AuthModule} from "@modules/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([City]), AuthModule],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
