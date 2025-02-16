import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '@modules/common/pagination.dto';

export class SearchOffersDto extends PaginationDto {
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

  @IsBoolean()
  @IsOptional()
  showInactive?: boolean;
}
