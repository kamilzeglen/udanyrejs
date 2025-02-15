import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedURLs1739633101135 implements MigrationInterface {
  name = 'AddedURLs1739633101135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pdf_file" ADD "url" character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "image_file" ADD "url" character varying(1024)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image_file" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "pdf_file" DROP COLUMN "url"`);
  }
}
