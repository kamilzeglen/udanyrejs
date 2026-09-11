import { MigrationInterface, QueryRunner } from 'typeorm';

interface CityDestinationAssignment {
  cityName: string;
  destinationName: string;
}

export class AssignCityDestinations1789161707498 implements MigrationInterface {
  name = 'AssignCityDestinations1789161707498';

  // "Dzień na morzu" celowo pominięty - to nie jest miasto, tylko dzień
  // rejsu bez portu, więc nie ma regionu do przypisania.
  private readonly assignments: CityDestinationAssignment[] = [
    { cityName: 'Alesund', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Bergen', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Geiranger', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Geirangerfjord', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Kristiansand', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Stavanger', destinationName: 'Norweskie Fiordy' },

    { cityName: 'Gdynia', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Helsinki', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Kilonia', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Kopenhaga', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Kłajpeda', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Ryga', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Sztokholm', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Tallinn', destinationName: 'Morze Bałtyckie' },
    { cityName: 'Warnemunde', destinationName: 'Morze Bałtyckie' },

    { cityName: 'Alicante', destinationName: 'Morze Śródziemne' },
    { cityName: 'Barcelona', destinationName: 'Morze Śródziemne' },
    { cityName: 'Cagliari', destinationName: 'Morze Śródziemne' },
    { cityName: 'Civitavecchia', destinationName: 'Morze Śródziemne' },
    { cityName: 'Genua', destinationName: 'Morze Śródziemne' },
    { cityName: 'Ibiza', destinationName: 'Morze Śródziemne' },
    { cityName: 'Livorno', destinationName: 'Morze Śródziemne' },
    { cityName: 'Malaga', destinationName: 'Morze Śródziemne' },
    { cityName: 'Marsylia', destinationName: 'Morze Śródziemne' },
    { cityName: 'Neapol', destinationName: 'Morze Śródziemne' },
    { cityName: 'Palermo', destinationName: 'Morze Śródziemne' },
    { cityName: 'Savona', destinationName: 'Morze Śródziemne' },
    { cityName: 'Tarragona', destinationName: 'Morze Śródziemne' },
    { cityName: 'Walencja', destinationName: 'Morze Śródziemne' },

    { cityName: 'Hawr', destinationName: 'Europa Północna' },
    { cityName: 'Vigo', destinationName: 'Wyspy Kanaryjskie' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const assignment of this.assignments) {
      await queryRunner.query(
        `INSERT INTO "city_destinations" ("cityId", "destinationId")
         SELECT "city"."id", "destination"."id"
         FROM "city", "destination"
         WHERE "city"."name" = $1 AND "destination"."name" = $2
         ON CONFLICT DO NOTHING`,
        [assignment.cityName, assignment.destinationName],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const assignment of this.assignments) {
      await queryRunner.query(
        `DELETE FROM "city_destinations"
         WHERE "cityId" = (SELECT "id" FROM "city" WHERE "name" = $1)
           AND "destinationId" = (SELECT "id" FROM "destination" WHERE "name" = $2)`,
        [assignment.cityName, assignment.destinationName],
      );
    }
  }
}
