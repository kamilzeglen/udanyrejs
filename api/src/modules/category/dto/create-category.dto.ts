import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsNumber()
  @IsOptional()
  position: number | null;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
