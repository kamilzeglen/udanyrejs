import { MigrationInterface, QueryRunner } from 'typeorm';

export class HideExistingCategories1789270000000 implements MigrationInterface {
  name = 'HideExistingCategories1789270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "migration_178927_category_visibility" ("categoryId" uuid PRIMARY KEY, "isVisible" boolean NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "migration_178927_category_visibility" ("categoryId", "isVisible") SELECT "id", "isVisible" FROM "category" ON CONFLICT ("categoryId") DO NOTHING`,
    );
    await queryRunner.query(`UPDATE "category" SET "isVisible" = false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "category" SET "isVisible" = visibility."isVisible" FROM "migration_178927_category_visibility" visibility WHERE "category"."id" = visibility."categoryId"`,
    );
    await queryRunner.query(
      `DROP TABLE "migration_178927_category_visibility"`,
    );
  }
}
