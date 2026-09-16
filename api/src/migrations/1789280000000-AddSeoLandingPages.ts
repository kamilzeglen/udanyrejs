import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeoLandingPages1789280000000 implements MigrationInterface {
  name = 'AddSeoLandingPages1789280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "slug" character varying(120)',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "seoTitle" character varying(255)',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "seoDescription" character varying(500)',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "description" text',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "imageFileId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "company" ADD COLUMN "slug" character varying(120)',
    );
    await queryRunner.query(
      'ALTER TABLE "company" ADD COLUMN "seoTitle" character varying(255)',
    );
    await queryRunner.query(
      'ALTER TABLE "company" ADD COLUMN "seoDescription" character varying(500)',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD CONSTRAINT "UQ_destination_slug" UNIQUE ("slug")',
    );
    await queryRunner.query(
      'ALTER TABLE "company" ADD CONSTRAINT "UQ_company_slug" UNIQUE ("slug")',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD CONSTRAINT "UQ_destination_imageFileId" UNIQUE ("imageFileId")',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD CONSTRAINT "FK_destination_imageFileId" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "destination" DROP CONSTRAINT "FK_destination_imageFileId"',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" DROP CONSTRAINT "UQ_destination_imageFileId"',
    );
    await queryRunner.query(
      'ALTER TABLE "company" DROP CONSTRAINT "UQ_company_slug"',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" DROP CONSTRAINT "UQ_destination_slug"',
    );
    await queryRunner.query(
      'ALTER TABLE "company" DROP COLUMN "seoDescription"',
    );
    await queryRunner.query('ALTER TABLE "company" DROP COLUMN "seoTitle"');
    await queryRunner.query('ALTER TABLE "company" DROP COLUMN "slug"');
    await queryRunner.query(
      'ALTER TABLE "destination" DROP COLUMN "imageFileId"',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" DROP COLUMN "description"',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" DROP COLUMN "seoDescription"',
    );
    await queryRunner.query('ALTER TABLE "destination" DROP COLUMN "seoTitle"');
    await queryRunner.query('ALTER TABLE "destination" DROP COLUMN "slug"');
  }
}
