import { MigrationInterface, QueryRunner } from 'typeorm';

interface ItineraryDay {
  day: number;
  date: string;
  city: string;
  cityId?: string;
  arrivalTime: string;
  departureTime: string;
}

interface OfferRow {
  id: string;
  itinerary: ItineraryDay[] | null;
}

// Znajduje albo tworzy miasto po nazwie (case-insensitive) i utrzymuje mapę
// nazwa -> id w pamięci, żeby ta sama nowa nazwa w kilku ofertach dostała
// dokładnie jedno, wspólne miasto zamiast duplikatu przy każdym wystąpieniu.
async function findOrCreateCityId(
  queryRunner: QueryRunner,
  cityIdByLowerName: Map<string, string>,
  rawName: string,
): Promise<string | null> {
  const name = rawName?.trim();

  if (!name) {
    return null;
  }

  const key = name.toLowerCase();
  const existingId = cityIdByLowerName.get(key);

  if (existingId) {
    return existingId;
  }

  const [created] = await queryRunner.query(
    `INSERT INTO "city" ("id", "name") VALUES (uuid_generate_v4(), $1) RETURNING "id"`,
    [name],
  );

  cityIdByLowerName.set(key, created.id);

  return created.id;
}

export class BackfillOfferItineraryCityIds1789163248588
  implements MigrationInterface
{
  name = 'BackfillOfferItineraryCityIds1789163248588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cities: { id: string; name: string }[] = await queryRunner.query(
      `SELECT "id", "name" FROM "city"`,
    );
    const cityIdByLowerName = new Map(
      cities.map((city) => [city.name.toLowerCase(), city.id]),
    );

    const offers: OfferRow[] = await queryRunner.query(
      `SELECT "id", "itinerary" FROM "offer" WHERE "itinerary" IS NOT NULL`,
    );

    for (const offer of offers) {
      const days = Array.isArray(offer.itinerary) ? offer.itinerary : [];

      const updatedDays: ItineraryDay[] = [];
      for (const day of days) {
        const cityId = await findOrCreateCityId(
          queryRunner,
          cityIdByLowerName,
          day.city,
        );

        updatedDays.push(cityId ? { ...day, cityId } : day);
      }

      await queryRunner.query(
        `UPDATE "offer" SET "itinerary" = $1 WHERE "id" = $2`,
        [JSON.stringify(updatedDays), offer.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const offers: OfferRow[] = await queryRunner.query(
      `SELECT "id", "itinerary" FROM "offer" WHERE "itinerary" IS NOT NULL`,
    );

    for (const offer of offers) {
      const days = Array.isArray(offer.itinerary) ? offer.itinerary : [];

      const revertedDays = days.map((day) => {
        const revertedDay = { ...day };
        delete revertedDay.cityId;
        return revertedDay;
      });

      await queryRunner.query(
        `UPDATE "offer" SET "itinerary" = $1 WHERE "id" = $2`,
        [JSON.stringify(revertedDays), offer.id],
      );
    }

    // Uwaga: miasta utworzone w up() (te, które wcześniej nie istniały)
    // celowo NIE są usuwane - to współdzielony słownik, mógł już zostać
    // wzbogacony o region przez admina; rewert tylko usuwa cityId z ofert.
  }
}
