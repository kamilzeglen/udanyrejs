import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@modules/company/company.entity';
import { Destination } from '@modules/destination/destination.entity';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Destination])],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
