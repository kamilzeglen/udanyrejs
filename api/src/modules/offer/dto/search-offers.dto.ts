import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SearchOffersDto {
  @IsOptional()
  @IsNumber()
  page?: number;

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
