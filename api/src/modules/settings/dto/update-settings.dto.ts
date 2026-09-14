import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  @IsOptional()
  scrapingEnabled?: boolean;

  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  scrapeHour?: number;

  @IsInt()
  @Min(0)
  @Max(59)
  @IsOptional()
  scrapeMinute?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  syncRequestDelayMs?: number;

  @IsBoolean()
  @IsOptional()
  termCleanupEnabled?: boolean;

  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  cleanupHour?: number;

  @IsInt()
  @Min(0)
  @Max(59)
  @IsOptional()
  cleanupMinute?: number;
}
