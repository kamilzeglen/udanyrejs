import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveCategoriesToOfferTerm1789167600000
  implements MigrationInterface
{
  name = 'MoveCategoriesToOfferTerm1789167600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "offer_term_categories" ("offerTermId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_offer_term_categories" PRIMARY KEY ("offerTermId", "categoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_term_categories_offerTermId" ON "offer_term_categories" ("offerTermId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_term_categories_categoryId" ON "offer_term_categories" ("categoryId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term_categories" ADD CONSTRAINT "FK_offer_term_categories_offerTermId" FOREIGN KEY ("offerTermId") REFERENCES "offer_term"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_term_categories" ADD CONSTRAINT "FK_offer_term_categories_categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Każdy termin dziedziczył dotąd cały zestaw kategorii swojej oferty -
    // to jedyne bezstratne 1:1 przeniesienie istniejącego stanu.
    await queryRunner.query(
      `INSERT INTO "offer_term_categories" ("offerTermId", "categoryId")
       SELECT ot."id", oc."categoryId"
       FROM "offer_categories" oc
       JOIN "offer_term" ot ON ot."offerId" = oc."offerId"
       ON CONFLICT DO NOTHING`,
    );

    // DROP TABLE zabiera ze sobą własne ograniczenia i indeksy - nie trzeba
    // (i nie da się bezpiecznie) wymieniać ich nazw z góry, bo down() poniżej
    // odtwarza tę tabelę pod innymi, własnymi nazwami ograniczeń.
    await queryRunner.query(`DROP TABLE "offer_categories"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "offer_categories" ("offerId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_offer_categories_restored" PRIMARY KEY ("offerId", "categoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_offerId_restored" ON "offer_categories" ("offerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_categoryId_restored" ON "offer_categories" ("categoryId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_offerId_restored" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_categoryId_restored" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `INSERT INTO "offer_categories" ("offerId", "categoryId")
       SELECT DISTINCT ot."offerId", otc."categoryId"
       FROM "offer_term_categories" otc
       JOIN "offer_term" ot ON ot."id" = otc."offerTermId"
       ON CONFLICT DO NOTHING`,
    );

    await queryRunner.query(`DROP TABLE "offer_term_categories"`);
  }
}
