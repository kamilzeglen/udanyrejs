import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCabinTypeDto {
  @IsString()
  name: string;

  @IsUUID()
  companyId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
