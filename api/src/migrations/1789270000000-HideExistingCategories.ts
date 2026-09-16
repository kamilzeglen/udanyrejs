import { MigrationInterface, QueryRunner } from 'typeorm';

export class HideExistingCategories1789270000000 implements MigrationInterface {
  name = 'HideExistingCategories1789270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "category" SET "isVisible" = false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "category" SET "isVisible" = true`);
  }
}
