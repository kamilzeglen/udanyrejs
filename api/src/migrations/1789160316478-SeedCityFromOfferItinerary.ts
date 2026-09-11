import { MigrationInterface, QueryRunner } from 'typeorm';

interface OfferItineraryRow {
  itinerary: { city?: string }[] | null;
}

export class SeedCityFromOfferItinerary1789160316478
  implements MigrationInterface
{
  name = 'SeedCityFromOfferItinerary1789160316478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cityNames = await this.extractDistinctCityNames(queryRunner);

    for (const name of cityNames) {
      await queryRunner.query(
        `INSERT INTO "city" ("id", "name") VALUES (uuid_generate_v4(), $1)`,
        [name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cityNames = await this.extractDistinctCityNames(queryRunner);

    for (const name of cityNames) {
      await queryRunner.query(
        `DELETE FROM "city"
         WHERE "name" = $1
           AND "id" NOT IN (SELECT "cityId" FROM "city_destinations")`,
        [name],
      );
    }
  }

  private async extractDistinctCityNames(
    queryRunner: QueryRunner,
  ): Promise<string[]> {
    const rows: OfferItineraryRow[] = await queryRunner.query(
      `SELECT "itinerary" FROM "offer" WHERE "itinerary" IS NOT NULL`,
    );

    const namesByLowerCase = new Map<string, string>();

    for (const row of rows) {
      const days = Array.isArray(row.itinerary) ? row.itinerary : [];

      for (const day of days) {
        const rawName = typeof day?.city === 'string' ? day.city.trim() : '';

        if (!rawName) {
          continue;
        }

        const key = rawName.toLowerCase();

        if (!namesByLowerCase.has(key)) {
          namesByLowerCase.set(key, rawName);
        }
      }
    }

    return Array.from(namesByLowerCase.values());
  }
}
