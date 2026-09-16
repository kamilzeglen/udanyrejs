import { QueryRunner } from 'typeorm';
import {
  SeedYearlySeasonCategories1789305000000,
  SEED_YEARLY_SEASON_CATEGORIES,
} from './1789305000000-SeedYearlySeasonCategories';

describe('SeedYearlySeasonCategories1789305000000', () => {
  it('inserts one hidden category row per generated season, once', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new SeedYearlySeasonCategories1789305000000().up({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('ON CONFLICT ("name") DO NOTHING');
    expect(sql).toMatch(
      /'Zima 2026'.*'winter-2026'.*NULL.*'2026-12-01'.*'2027-02-28'.*false/,
    );
    expect(sql).toMatch(
      /'Zima 2027'.*'winter-2027'.*NULL.*'2027-12-01'.*'2028-02-29'/,
    );
    expect(sql).toContain(
      "'Last Minute', 'last-minute', 5, '2026-09-01', '2026-10-31', false",
    );
    expect(SEED_YEARLY_SEASON_CATEGORIES).toHaveLength(26);
  });

  it('removes every generated category by name on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new SeedYearlySeasonCategories1789305000000().down({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('DELETE FROM "category"');
    expect(sql).toContain("'Zima 2026'");
    expect(sql).toContain("'Last Minute'");
  });
});
