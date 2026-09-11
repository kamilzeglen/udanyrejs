import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScraperClientService } from './scraper-client.service';

@Module({
  imports: [HttpModule],
  providers: [ScraperClientService],
  exports: [ScraperClientService],
})
export class ScraperClientModule {}
