import { MigrationInterface, QueryRunner } from 'typeorm';

export const MISSING_CITY_COORDINATES: Array<[string, number, number]> = [
  ['Argostoli', 38.175673, 20.48788],
  ['Bari', 41.125784, 16.862029],
  ['Cagliari', 39.217199, 9.113311],
  ['Eidfjord', 60.345658, 7.401215],
  ['Fredericia', 55.565268, 9.756217],
  ['Geiranger', 62.100628, 7.205896],
  ['Geirangerfjord', 62.103144, 7.098859],
  ['Głębia Calypso', 36.567, 21.133],
  ['Haugesund', 59.468248, 5.082761],
  ['Hilo', 19.707373, -155.08158],
  ['Ketchikan', 55.34307, -131.646682],
  ['Kopenhaga', 55.686724, 12.570072],
  ['Kristiansand', 58.085628, 7.931858],
  ['Lido', 45.416459, 12.370612],
  ['Marghera', 45.47581, 12.224781],
  ['Newport', 41.489983, -71.313771],
  ['Puerto Plata', 19.797656, -70.693261],
  ['Santorini', 36.407111, 25.456664],
  ['Savona', 44.233424, 8.252573],
  ['Seyne Sur Mer', 43.100771, 5.878895],
  ['St. Thomas', 18.342908, -64.9189],
  ['Tortola', 18.421057, -64.638833],
  ['Vik', 61.034966, 6.594105],
  ['Warnemunde', 54.177904, 12.081288],
  ['Zatoka Lodowców', 58.70691, -136.1673],
  ['Zatoka Palma', 39.50456, 2.64625],
];

export class BackfillMissingCityCoordinates1789330000000
  implements MigrationInterface
{
  public readonly name = 'BackfillMissingCityCoordinates1789330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [name, latitude, longitude] of MISSING_CITY_COORDINATES) {
      await queryRunner.query(
        `UPDATE "city" SET "latitude" = $1, "longitude" = $2 WHERE "name" = $3 AND ("latitude" IS NULL OR "longitude" IS NULL)`,
        [latitude, longitude, name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = MISSING_CITY_COORDINATES.map(([name]) => name);

    await queryRunner.query(
      `UPDATE "city" SET "latitude" = NULL, "longitude" = NULL WHERE "name" = ANY($1)`,
      [names],
    );
  }
}
