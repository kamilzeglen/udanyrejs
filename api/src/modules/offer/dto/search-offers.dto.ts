import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchOffersDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsUUID('all', { each: true })
  @IsOptional()
  destinationIdList?: string[];

  @IsUUID('all', { each: true })
  @IsOptional()
  companyIdList?: string[];
}
