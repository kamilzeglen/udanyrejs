import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsUUID('all', { each: true })
  @IsOptional()
  destinations?: string[];
}
