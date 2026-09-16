import { MigrationInterface, QueryRunner } from 'typeorm';

export const CITY_DESTINATION_ASSIGNMENTS: Array<[string, string]> = [
  ['Argostoli', 'Wyspy Greckie'],
  ['Bari', 'Morze Adriatyckie'],
  ['Cagliari', 'Morze Śródziemne'],
  ['Eidfjord', 'Norweskie Fiordy'],
  ['Fredericia', 'Morze Bałtyckie'],
  ['Geiranger', 'Norweskie Fiordy'],
  ['Geirangerfjord', 'Norweskie Fiordy'],
  ['Głębia Calypso', 'Morze Śródziemne'],
  ['Haugesund', 'Norweskie Fiordy'],
  ['Hilo', 'Hawaje'],
  ['Ketchikan', 'Alaska'],
  ['Kopenhaga', 'Morze Bałtyckie'],
  ['Kristiansand', 'Norweskie Fiordy'],
  ['Lido', 'Morze Śródziemne'],
  ['Marghera', 'Morze Śródziemne'],
  ['Newport', 'Kanada i Nowa Anglia'],
  ['Puerto Plata', 'Karaiby'],
  ['Santorini', 'Wyspy Greckie'],
  ['Savona', 'Morze Śródziemne'],
  ['Seyne Sur Mer', 'Morze Śródziemne'],
  ['St. Thomas', 'Karaiby'],
  ['Tortola', 'Karaiby'],
  ['Vik', 'Norweskie Fiordy'],
  ['Warnemunde', 'Morze Bałtyckie'],
  ['Zatoka Lodowców', 'Alaska'],
  ['Zatoka Palma', 'Morze Śródziemne'],
];

export class AssignMissingCityDestinations1789320000000
  implements MigrationInterface
{
  public readonly name = 'AssignMissingCityDestinations1789320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [cityName, destinationName] of CITY_DESTINATION_ASSIGNMENTS) {
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
    for (const [cityName, destinationName] of CITY_DESTINATION_ASSIGNMENTS) {
      await queryRunner.query(
        `DELETE FROM "city_destinations"
         WHERE "cityId" = (SELECT "id" FROM "city" WHERE "name" = $1)
           AND "destinationId" = (SELECT "id" FROM "destination" WHERE "name" = $2)`,
        [cityName, destinationName],
      );
    }
  }
}
