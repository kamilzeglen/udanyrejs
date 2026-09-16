import { MigrationInterface, QueryRunner } from 'typeorm';

interface SeasonCategory {
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  position: number | null;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function buildYearlySeasonCategories(years: number[]): SeasonCategory[] {
  const categories: SeasonCategory[] = [];

  for (const year of years) {
    const winterEndYear = year + 1;
    const winterEndDay = isLeapYear(winterEndYear) ? 29 : 28;

    categories.push(
      {
        name: `Wiosna ${year}`,
        url: `spring-${year}`,
        startDate: `${year}-03-01`,
        endDate: `${year}-05-31`,
        position: null,
      },
      {
        name: `Majówka ${year}`,
        url: `long-week-${year}`,
        startDate: `${year}-04-27`,
        endDate: `${year}-05-03`,
        position: null,
      },
      {
        name: `Wakacje ${year}`,
        url: `holidays-${year}`,
        startDate: `${year}-06-27`,
        endDate: `${year}-08-31`,
        position: null,
      },
      {
        name: `Jesień ${year}`,
        url: `autumn-${year}`,
        startDate: `${year}-09-01`,
        endDate: `${year}-11-30`,
        position: null,
      },
      {
        name: `Zima ${year}`,
        url: `winter-${year}`,
        startDate: `${year}-12-01`,
        endDate: `${winterEndYear}-02-${winterEndDay}`,
        position: null,
      },
    );
  }

  return categories;
}

export const SEED_YEARLY_SEASON_CATEGORIES: SeasonCategory[] = [
  ...buildYearlySeasonCategories([2026, 2027, 2028, 2029, 2030]),
  {
    name: 'Last Minute',
    url: 'last-minute',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    position: 5,
  },
];

export class SeedYearlySeasonCategories1789305000000
  implements MigrationInterface
{
  public readonly name = 'SeedYearlySeasonCategories1789305000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const values = SEED_YEARLY_SEASON_CATEGORIES.map(
      (category) =>
        `('${category.name}', '${category.url}', ${category.position ?? 'NULL'}, '${category.startDate}', '${category.endDate}', false)`,
    ).join(',\n        ');

    await queryRunner.query(`
      INSERT INTO "category" ("name", "url", "position", "startDate", "endDate", "isVisible")
      VALUES
        ${values}
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = SEED_YEARLY_SEASON_CATEGORIES.map(
      (category) => `'${category.name}'`,
    ).join(', ');

    await queryRunner.query(
      `DELETE FROM "category" WHERE "name" IN (${names})`,
    );
  }
}
