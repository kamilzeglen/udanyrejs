import { MigrationInterface, QueryRunner } from 'typeorm';

interface CityDestinationAssignment {
  cityName: string;
  destinationName: string;
}

export class AssignRemainingCityDestinations1789165935908
  implements MigrationInterface
{
  name = 'AssignRemainingCityDestinations1789165935908';

  // Miasta dodane automatycznie przez backfille draftów/ofert od czasu
  // AssignCityDestinations1789161707498. "Dzień na morzu" celowo pominięty
  // - to nie jest miasto, tylko dzień rejsu bez portu.
  private readonly assignments: CityDestinationAssignment[] = [
    { cityName: 'Flam', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Haugesund', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Hellesylt', destinationName: 'Norweskie Fiordy' },
    { cityName: 'Oslo', destinationName: 'Norweskie Fiordy' },

    { cityName: 'Skagen', destinationName: 'Morze Bałtyckie' },

    { cityName: 'Southampton', destinationName: 'Europa Północna' },
    { cityName: 'A Coruna', destinationName: 'Europa Północna' },
    { cityName: 'Lizbona', destinationName: 'Europa Północna' },
    { cityName: 'Kadyks', destinationName: 'Europa Północna' },

    { cityName: 'Gibraltar', destinationName: 'Morze Śródziemne' },
    { cityName: 'Palma de Mallorca', destinationName: 'Morze Śródziemne' },
    { cityName: 'Mesyna', destinationName: 'Morze Śródziemne' },
    { cityName: 'Valletta', destinationName: 'Morze Śródziemne' },
    { cityName: 'La Goulette', destinationName: 'Morze Śródziemne' },

    { cityName: 'Miami', destinationName: 'Karaiby' },
    { cityName: 'Roatan', destinationName: 'Karaiby' },
    { cityName: 'Costa Maya', destinationName: 'Karaiby' },
    { cityName: 'Cozumel', destinationName: 'Karaiby' },
    { cityName: 'Philipsburg', destinationName: 'Karaiby' },
    { cityName: 'Charlotte Amalie', destinationName: 'Karaiby' },
    { cityName: 'Cartagena de Indias', destinationName: 'Karaiby' },
    { cityName: 'Oranjestad', destinationName: 'Karaiby' },
    { cityName: 'Willemstad', destinationName: 'Karaiby' },

    { cityName: 'Coco Cay', destinationName: 'Bahamy' },
    { cityName: 'Ocean Cay MSC Marine Reserve', destinationName: 'Bahamy' },

    { cityName: 'Colon', destinationName: 'Kanał Panamski' },

    { cityName: 'Szanghaj', destinationName: 'Azja' },
    { cityName: 'Gangjeong', destinationName: 'Azja' },
    { cityName: 'Pusan', destinationName: 'Azja' },
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
