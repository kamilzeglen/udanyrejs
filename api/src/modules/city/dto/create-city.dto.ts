import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateBy,
  ValidationArguments,
} from 'class-validator';

interface CoordinatePair {
  latitude?: number | null;
  longitude?: number | null;
}

function isMissingCoordinate(value: number | null | undefined): boolean {
  return value === null || value === undefined;
}

function IsCoordinatePair() {
  return ValidateBy({
    name: 'isCoordinatePair',
    validator: {
      validate(_value: unknown, args: ValidationArguments): boolean {
        const coordinates = args.object as CoordinatePair;

        return (
          isMissingCoordinate(coordinates.latitude) ===
          isMissingCoordinate(coordinates.longitude)
        );
      },
    },
  });
}

export class CreateCityDto {
  @IsString()
  name: string;

  @IsUUID('all', { each: true })
  @IsOptional()
  destinations?: string[];

  @IsCoordinatePair()
  @Max(90)
  @Min(-90)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsOptional()
  latitude?: number | null;

  @IsCoordinatePair()
  @Max(180)
  @Min(-180)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsOptional()
  longitude?: number | null;
}
