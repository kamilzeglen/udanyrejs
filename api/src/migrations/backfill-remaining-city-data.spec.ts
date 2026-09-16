import { QueryRunner } from 'typeorm';
import {
  BackfillRemainingCityData1789350000000,
  REMAINING_CITY_DATA,
} from './1789350000000-BackfillRemainingCityData';

describe('BackfillRemainingCityData1789350000000', () => {
  it('contains every geographic city that is still missing coordinates and a region', () => {
    expect(REMAINING_CITY_DATA.map(([cityName]) => cityName)).toEqual([
      'Invergordon',
      'Katakolon',
      'Kirkwall',
      'Korfu',
      'Marmaris',
      'Oslo',
      'Oslofjord',
      'Queensferry',
      'Skagen',
      'Triest',
    ]);
  });

  it('fills only missing coordinates and assigns a region idempotently', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new BackfillRemainingCityData1789350000000().up({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(REMAINING_CITY_DATA.length * 2);
    expect(query.mock.calls[0][0]).toContain(
      '"latitude" IS NULL OR "longitude" IS NULL',
    );
    expect(query.mock.calls[1][0]).toContain('ON CONFLICT DO NOTHING');
    expect(query.mock.calls[0][1]).toEqual([
      REMAINING_CITY_DATA[0][1],
      REMAINING_CITY_DATA[0][2],
      REMAINING_CITY_DATA[0][0],
    ]);
    expect(query.mock.calls[1][1]).toEqual([
      REMAINING_CITY_DATA[0][0],
      REMAINING_CITY_DATA[0][3],
    ]);
  });
});
