import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsString()
  orderBy: string;

  @IsString()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  orderDir: 'asc' | 'desc';

  @IsNumber()
  @Min(0)
  offset: number;

  @IsNumber()
  @Min(1)
  @Max(10000)
  limit: number;
}
