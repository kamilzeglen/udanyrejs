import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@modules/company/company.entity';
import { ImageFileModule } from '@modules/image-file/image-file.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    ImageFileModule,
    UserModule,
    AuthModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
