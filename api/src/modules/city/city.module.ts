import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '@modules/city/city.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { DestinationModule } from '@modules/destination/destination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
    UserModule,
    AuthModule,
    DestinationModule,
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
