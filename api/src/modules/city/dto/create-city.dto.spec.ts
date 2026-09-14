import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateCityDto } from './create-city.dto';
import { UpdateCityDto } from './update-city.dto';

describe('CreateCityDto coordinates', () => {
  it('accepts a city without coordinates', () => {
    const dto = plainToInstance(CreateCityDto, { name: 'Gdynia' });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('accepts a complete coordinate pair within geographic ranges', () => {
    const dto = plainToInstance(CreateCityDto, {
      name: 'Gdynia',
      latitude: 54.5189,
      longitude: 18.5305,
    });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it.each([
    [{ latitude: 54.5189 }, 'latitude'],
    [{ longitude: 18.5305 }, 'longitude'],
    [{ latitude: 91, longitude: 18.5305 }, 'latitude'],
    [{ latitude: 54.5189, longitude: 181 }, 'longitude'],
  ])('rejects invalid coordinates %o', (coordinates, invalidProperty) => {
    const dto = plainToInstance(CreateCityDto, {
      name: 'Gdynia',
      ...coordinates,
    });

    const errors = validateSync(dto);

    expect(errors.map((error) => error.property)).toContain(invalidProperty);
  });

  it('rejects an update containing only one coordinate', () => {
    const dto = plainToInstance(UpdateCityDto, { latitude: 54.5189 });

    const errors = validateSync(dto);

    expect(errors.map((error) => error.property)).toContain('latitude');
  });
});
