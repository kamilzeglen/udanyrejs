import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveShareStatsToOfferTerm1789171200000
  implements MigrationInterface
{
  name = 'MoveShareStatsToOfferTerm1789171200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "share_stats" ADD COLUMN "termId" uuid`,
    );

    // Nic dziś nie jest opublikowane (potwierdzone) - liczniki startują od
    // zera per termin, nie próbujemy przenosić starych, testowych wartości.
    await queryRunner.query(
      `INSERT INTO "share_stats" (id, "termId", "offerId", "webClicks", "facebookClicks", "instagramClicks", "tiktokClicks")
       SELECT uuid_generate_v4(), ot.id, ot."offerId", 0, 0, 0, 0
       FROM "offer_term" ot`,
    );

    // Stare wiersze per-oferta muszą przestać być referencjonowane przez
    // offer.shareStatsId, zanim je usuniemy - inaczej FK_...08f1 to zablokuje.
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT IF EXISTS "FK_3dd4dca033ce2aa12e535ae08f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP COLUMN IF EXISTS "shareStatsId"`,
    );

    await queryRunner.query(`DELETE FROM "share_stats" WHERE "termId" IS NULL`);

    await queryRunner.query(
      `ALTER TABLE "share_stats" ALTER COLUMN "termId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_stats" ADD CONSTRAINT "UQ_share_stats_termId" UNIQUE ("termId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_stats" ADD CONSTRAINT "FK_share_stats_termId" FOREIGN KEY ("termId") REFERENCES "offer_term"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer" ADD COLUMN "shareStatsId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "REL_3dd4dca033ce2aa12e535ae08f" UNIQUE ("shareStatsId")`,
    );

    // termId ma dziś NOT NULL - trzeba to zluzować, zanim wstawimy wiersze
    // per-oferta, które z definicji nie mają jednego konkretnego terminu.
    await queryRunner.query(
      `ALTER TABLE "share_stats" ALTER COLUMN "termId" DROP NOT NULL`,
    );

    // Jeden świeży, wyzerowany wiersz per oferta - tak samo jak up() startuje
    // od zera per termin, down() startuje od zera per oferta. Granularność
    // per-termin jest tracona, to symetryczne z tym, że up() też nie
    // próbuje zachować starych liczników.
    await queryRunner.query(
      `INSERT INTO "share_stats" (id, "offerId", "webClicks", "facebookClicks", "instagramClicks", "tiktokClicks")
       SELECT uuid_generate_v4(), o.id, 0, 0, 0, 0
       FROM "offer" o`,
    );

    // share_stats."offerId" jest historycznie character varying (nie uuid,
    // niespójność sprzed tej migracji) - stąd jawny rzutunek w porównaniu.
    await queryRunner.query(
      `UPDATE "offer" o SET "shareStatsId" = ss.id
       FROM "share_stats" ss
       WHERE ss."offerId" = o.id::text AND ss."termId" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_3dd4dca033ce2aa12e535ae08f1" FOREIGN KEY ("shareStatsId") REFERENCES "share_stats"("id")`,
    );

    await queryRunner.query(
      `DELETE FROM "share_stats" WHERE "termId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_stats" DROP CONSTRAINT IF EXISTS "FK_share_stats_termId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_stats" DROP CONSTRAINT IF EXISTS "UQ_share_stats_termId"`,
    );
    await queryRunner.query(`ALTER TABLE "share_stats" DROP COLUMN "termId"`);
  }
}
