import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@modules/category/category.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoryImportExportService } from './category-import-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule, AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryImportExportService],
  exports: [CategoryService, CategoryImportExportService],
})
export class CategoryModule {}
