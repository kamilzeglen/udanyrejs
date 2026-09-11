import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class DiscoverOffersDto {
  @IsInt()
  @Min(1)
  @Max(100)
  count: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  companyIds: string[];
}
