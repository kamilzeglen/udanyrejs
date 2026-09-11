import { IsString, IsUrl } from 'class-validator';

export class ScrapeOfferDto {
  @IsString()
  @IsUrl()
  url: string;
}
