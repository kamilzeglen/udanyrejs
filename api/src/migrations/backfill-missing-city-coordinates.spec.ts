import {
  BackfillMissingCityCoordinates1789330000000,
  MISSING_CITY_COORDINATES,
} from './1789330000000-BackfillMissingCityCoordinates';
import { QueryRunner } from 'typeorm';

describe('BackfillMissingCityCoordinates1789330000000', () => {
  it('contains coordinates for every current geographic location missing them', () => {
    expect(MISSING_CITY_COORDINATES.map(([name]) => name)).toEqual(
      expect.arrayContaining([
        'Argostoli',
        'Bari',
        'Cagliari',
        'Eidfjord',
        'Fredericia',
        'Geiranger',
        'Geirangerfjord',
        'Głębia Calypso',
        'Haugesund',
        'Hilo',
        'Ketchikan',
        'Kopenhaga',
        'Kristiansand',
        'Lido',
        'Marghera',
        'Newport',
        'Puerto Plata',
        'Santorini',
        'Savona',
        'Seyne Sur Mer',
        'St. Thomas',
        'Tortola',
        'Vik',
        'Warnemunde',
        'Zatoka Lodowców',
        'Zatoka Palma',
      ]),
    );
  });

  it('updates cities with an incomplete coordinate pair', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new BackfillMissingCityCoordinates1789330000000().up({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(MISSING_CITY_COORDINATES.length);
    expect(query.mock.calls[0][0]).toContain(
      '"latitude" IS NULL OR "longitude" IS NULL',
    );
  });
});
