import { MigrationInterface, QueryRunner } from 'typeorm';

interface ItineraryDay {
  day: number;
  date: string;
  city: string;
  cityId?: string;
  arrivalTime: string;
  departureTime: string;
}

interface DraftRow {
  id: string;
  itinerary: ItineraryDay[] | null;
}

// Znajduje albo tworzy miasto po nazwie (case-insensitive) i utrzymuje mapę
// nazwa -> id w pamięci, żeby ta sama nowa nazwa w kilku draftach dostała
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

export class BackfillDraftItineraryCityIds1789164550478
  implements MigrationInterface
{
  name = 'BackfillDraftItineraryCityIds1789164550478';

  // Zaległe drafty w poczekalni scrapera powstały zanim
  // ItineraryCityResolverService zaczął wiązać/tworzyć miasta przy
  // discoverOneOffer - ten backfill dogania je jednorazowo. Nowe drafty
  // (po tej zmianie) dostają cityId już przy scrapowaniu, bez migracji.
  public async up(queryRunner: QueryRunner): Promise<void> {
    const cities: { id: string; name: string }[] = await queryRunner.query(
      `SELECT "id", "name" FROM "city"`,
    );
    const cityIdByLowerName = new Map(
      cities.map((city) => [city.name.toLowerCase(), city.id]),
    );

    const drafts: DraftRow[] = await queryRunner.query(
      `SELECT "id", "itinerary" FROM "scraped_offer_draft" WHERE "itinerary" IS NOT NULL`,
    );

    for (const draft of drafts) {
      const days = Array.isArray(draft.itinerary) ? draft.itinerary : [];

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
        `UPDATE "scraped_offer_draft" SET "itinerary" = $1 WHERE "id" = $2`,
        [JSON.stringify(updatedDays), draft.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const drafts: DraftRow[] = await queryRunner.query(
      `SELECT "id", "itinerary" FROM "scraped_offer_draft" WHERE "itinerary" IS NOT NULL`,
    );

    for (const draft of drafts) {
      const days = Array.isArray(draft.itinerary) ? draft.itinerary : [];

      const revertedDays = days.map((day) => {
        const revertedDay = { ...day };
        delete revertedDay.cityId;
        return revertedDay;
      });

      await queryRunner.query(
        `UPDATE "scraped_offer_draft" SET "itinerary" = $1 WHERE "id" = $2`,
        [JSON.stringify(revertedDays), draft.id],
      );
    }

    // Uwaga: miasta utworzone w up() celowo NIE są usuwane - współdzielony
    // słownik mógł już zostać wzbogacony o region przez admina.
  }
}
