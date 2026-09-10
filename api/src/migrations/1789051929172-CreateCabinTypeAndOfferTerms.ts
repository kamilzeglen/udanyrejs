import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCabinTypeAndOfferTerms1789051929172
  implements MigrationInterface
{
  name = 'CreateCabinTypeAndOfferTerms1789051929172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cabin_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "companyId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cabin_type_company_name" UNIQUE ("companyId", "name"), CONSTRAINT "PK_cabin_type" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" ADD CONSTRAINT "FK_cabin_type_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" ADD CONSTRAINT "FK_cabin_type_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" ADD CONSTRAINT "FK_cabin_type_updated_by" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "offer_term" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offerId" uuid NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_offer_term_offer_dates" UNIQUE ("offerId", "startDate", "endDate"), CONSTRAINT "PK_offer_term" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term" ADD CONSTRAINT "FK_offer_term_offer" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "offer_term_price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offerTermId" uuid NOT NULL, "cabinTypeId" uuid NOT NULL, "price" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_offer_term_price_term_cabin" UNIQUE ("offerTermId", "cabinTypeId"), CONSTRAINT "PK_offer_term_price" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term_price" ADD CONSTRAINT "FK_offer_term_price_term" FOREIGN KEY ("offerTermId") REFERENCES "offer_term"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term_price" ADD CONSTRAINT "FK_offer_term_price_cabin_type" FOREIGN KEY ("cabinTypeId") REFERENCES "cabin_type"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // Domyślny rodzaj kabiny per firma - potrzebny do przypisania istniejących
    // cen ofert (sprzed wielu terminów/kabin) do jakiejś konkretnej kabiny.
    await queryRunner.query(`
      INSERT INTO "cabin_type" ("id", "name", "companyId", "isActive", "createdAt", "updatedAt")
      SELECT uuid_generate_v4(), 'Standard', c.id, true, now(), now()
      FROM "company" c
      WHERE EXISTS (SELECT 1 FROM "offer" o WHERE o."companyId" = c.id)
    `);

    // Jeden termin na każdą istniejącą ofertę, z jej dotychczasowych dat.
    await queryRunner.query(`
      INSERT INTO "offer_term" ("id", "offerId", "startDate", "endDate", "createdAt", "updatedAt")
      SELECT uuid_generate_v4(), o.id, o."startDate", o."endDate", now(), now()
      FROM "offer" o
    `);

    // Jedna cena (dla domyślnej kabiny "Standard" tej firmy) na każdy nowy termin.
    await queryRunner.query(`
      INSERT INTO "offer_term_price" ("id", "offerTermId", "cabinTypeId", "price", "createdAt", "updatedAt")
      SELECT uuid_generate_v4(), ot.id, ct.id, o.price, now(), now()
      FROM "offer_term" ot
      JOIN "offer" o ON o.id = ot."offerId"
      JOIN "cabin_type" ct ON ct."companyId" = o."companyId" AND ct.name = 'Standard'
    `);

    await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "startDate"`);
    await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "endDate"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer" ADD "price" integer`);
    await queryRunner.query(`ALTER TABLE "offer" ADD "startDate" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "offer" ADD "endDate" TIMESTAMP`);

    // Odtwórz startDate/endDate z najwcześniejszego terminu każdej oferty.
    await queryRunner.query(`
      UPDATE "offer" o
      SET "startDate" = first_term."startDate", "endDate" = first_term."endDate"
      FROM (
        SELECT DISTINCT ON (ot."offerId") ot."offerId", ot."startDate", ot."endDate"
        FROM "offer_term" ot
        ORDER BY ot."offerId", ot."startDate" ASC
      ) first_term
      WHERE first_term."offerId" = o.id
    `);

    // Odtwórz price jako najniższą cenę spośród wszystkich terminów/kabin oferty.
    // Uwaga: jeśli po migracji dodano więcej niż jeden termin, ten rollback
    // spłaszcza dane do jednej ceny/daty - traci informację o pozostałych
    // terminach. To świadomy kompromis ratunkowy, nie pełne odtworzenie stanu.
    await queryRunner.query(`
      UPDATE "offer" o
      SET "price" = cheapest."minPrice"
      FROM (
        SELECT ot."offerId", MIN(otp.price) AS "minPrice"
        FROM "offer_term" ot
        JOIN "offer_term_price" otp ON otp."offerTermId" = ot.id
        GROUP BY ot."offerId"
      ) cheapest
      WHERE cheapest."offerId" = o.id
    `);

    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "price" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "startDate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "endDate" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer_term_price" DROP CONSTRAINT "FK_offer_term_price_cabin_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term_price" DROP CONSTRAINT "FK_offer_term_price_term"`,
    );
    await queryRunner.query(`DROP TABLE "offer_term_price"`);

    await queryRunner.query(
      `ALTER TABLE "offer_term" DROP CONSTRAINT "FK_offer_term_offer"`,
    );
    await queryRunner.query(`DROP TABLE "offer_term"`);

    await queryRunner.query(
      `ALTER TABLE "cabin_type" DROP CONSTRAINT "FK_cabin_type_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" DROP CONSTRAINT "FK_cabin_type_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" DROP CONSTRAINT "FK_cabin_type_company"`,
    );
    await queryRunner.query(`DROP TABLE "cabin_type"`);
  }
}
