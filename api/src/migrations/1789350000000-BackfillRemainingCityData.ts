import { MigrationInterface, QueryRunner } from 'typeorm';

export const REMAINING_CITY_DATA: Array<[string, number, number, string]> = [
  ['Invergordon', 57.6884, -4.16921, 'Europa Północna'],
  ['Katakolon', 37.6573, 21.3169, 'Wyspy Greckie'],
  ['Kirkwall', 58.9847, -2.9582, 'Europa Północna'],
  ['Korfu', 39.6243, 19.9217, 'Wyspy Greckie'],
  ['Marmaris', 36.855, 28.2742, 'Morze Egejskie'],
  ['Oslo', 59.9139, 10.7522, 'Norweskie Fiordy'],
  ['Oslofjord', 59.8551, 10.713, 'Norweskie Fiordy'],
  ['Queensferry', 55.987, -3.399, 'Europa Północna'],
  ['Skagen', 57.7209, 10.5839, 'Morze Bałtyckie'],
  ['Triest', 45.6495, 13.7768, 'Morze Adriatyckie'],
];

export class BackfillRemainingCityData1789350000000
  implements MigrationInterface
{
  public readonly name = 'BackfillRemainingCityData1789350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [
      cityName,
      latitude,
      longitude,
      destinationName,
    ] of REMAINING_CITY_DATA) {
      await queryRunner.query(
        `UPDATE "city" SET "latitude" = $1, "longitude" = $2 WHERE "name" = $3 AND ("latitude" IS NULL OR "longitude" IS NULL)`,
        [latitude, longitude, cityName],
      );

      await queryRunner.query(
        `INSERT INTO "city_destinations" ("cityId", "destinationId")
         SELECT "city"."id", "destination"."id"
         FROM "city", "destination"
         WHERE "city"."name" = $1 AND "destination"."name" = $2
         ON CONFLICT DO NOTHING`,
        [cityName, destinationName],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cityNames = REMAINING_CITY_DATA.map(([cityName]) => cityName);

    await queryRunner.query(
      `UPDATE "city" SET "latitude" = NULL, "longitude" = NULL WHERE "name" = ANY($1)`,
      [cityNames],
    );

    for (const [cityName, , , destinationName] of REMAINING_CITY_DATA) {
      await queryRunner.query(
        `DELETE FROM "city_destinations"
         WHERE "cityId" = (SELECT "id" FROM "city" WHERE "name" = $1)
           AND "destinationId" = (SELECT "id" FROM "destination" WHERE "name" = $2)`,
        [cityName, destinationName],
      );
    }
  }
}
