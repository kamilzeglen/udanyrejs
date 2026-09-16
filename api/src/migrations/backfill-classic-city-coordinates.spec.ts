import { QueryRunner } from 'typeorm';
import {
  BackfillClassicCityCoordinates1789340000000,
  CLASSIC_CITY_COORDINATES,
} from './1789340000000-BackfillClassicCityCoordinates';

describe('BackfillClassicCityCoordinates1789340000000', () => {
  it('covers the original set of cities used before the newest batch was added', () => {
    expect(CLASSIC_CITY_COORDINATES.map(([name]) => name)).toEqual(
      expect.arrayContaining([
        'Civitavecchia',
        'Livorno',
        'Mykonos',
        'Heraklion',
        'Stambuł',
      ]),
    );
    expect(CLASSIC_CITY_COORDINATES).toHaveLength(93);
  });

  it('sets coordinates for every known city, only where missing', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new BackfillClassicCityCoordinates1789340000000().up({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(CLASSIC_CITY_COORDINATES.length);
    const [firstSql, firstParams] = query.mock.calls[0];
    expect(firstSql).toContain('"latitude" IS NULL');
    expect(firstSql).toContain('"longitude" IS NULL');
    const [name, latitude, longitude] = CLASSIC_CITY_COORDINATES[0];
    expect(firstParams).toEqual([latitude, longitude, name]);
  });

  it('clears coordinates for every known city on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new BackfillClassicCityCoordinates1789340000000().down({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('"latitude" = NULL');
    expect(params[0]).toEqual(CLASSIC_CITY_COORDINATES.map(([name]) => name));
  });
});
