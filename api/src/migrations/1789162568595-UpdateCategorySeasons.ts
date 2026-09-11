import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCategorySeasons1789162568595 implements MigrationInterface {
  name = 'UpdateCategorySeasons1789162568595';

  // Uwaga: Category.startDate/endDate to sztywne, jednorazowe daty (nie
  // powtarzają się co roku same z siebie) - te wartości pokrywają sezon
  // 2026/2027 i będą wymagały ręcznej aktualizacji przez admina w kolejnych
  // latach. "Last Minute" celowo pominięty - to nie sezon kalendarzowy,
  // tylko "wyjazd niedługo od dziś", nie pasuje do sztywnego przedziału dat.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "category"
       SET "url" = 'winter', "startDate" = $1, "endDate" = $2
       WHERE "name" = 'Zima'`,
      ['2026-12-01', '2027-02-28'],
    );

    await queryRunner.query(
      `UPDATE "category"
       SET "startDate" = $1, "endDate" = $2
       WHERE "name" = 'Majówka'`,
      ['2026-04-27', '2026-05-03'],
    );

    await queryRunner.query(
      `UPDATE "category"
       SET "startDate" = $1, "endDate" = $2
       WHERE "name" = 'Wakacje'`,
      ['2026-06-27', '2026-08-31'],
    );

    await queryRunner.query(
      `INSERT INTO "category" ("id", "name", "url", "position", "startDate", "endDate", "isActive", "isVisible")
       VALUES (uuid_generate_v4(), $1, $2, NULL, $3, $4, true, true)`,
      ['Jesień', 'autumn', '2026-09-01', '2026-11-30'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "category" WHERE "name" = 'Jesień'`);

    await queryRunner.query(
      `UPDATE "category"
       SET "startDate" = NULL, "endDate" = NULL
       WHERE "name" = 'Wakacje'`,
    );

    await queryRunner.query(
      `UPDATE "category"
       SET "startDate" = NULL, "endDate" = NULL
       WHERE "name" = 'Majówka'`,
    );

    await queryRunner.query(
      `UPDATE "category"
       SET "url" = 'winder', "startDate" = NULL, "endDate" = NULL
       WHERE "name" = 'Zima'`,
    );
  }
}
