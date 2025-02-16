import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryDates1739734882564 implements MigrationInterface {
  name = 'AddCategoryDates1739734882564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" ADD "startDate" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "category" ADD "endDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "endDate"`);
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "startDate"`);
  }
}
