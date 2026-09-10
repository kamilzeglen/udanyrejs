import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CabinTypeService } from './cabin-type.service';
import { CabinTypeController } from './cabin-type.controller';
import { CabinType } from './cabin-type.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CabinType]), UserModule, AuthModule],
  controllers: [CabinTypeController],
  providers: [CabinTypeService],
  exports: [CabinTypeService],
})
export class CabinTypeModule {}
