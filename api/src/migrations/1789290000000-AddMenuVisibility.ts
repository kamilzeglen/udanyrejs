import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMenuVisibility1789290000000 implements MigrationInterface {
  name = 'AddMenuVisibility1789290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "destination" ADD COLUMN "showInMenu" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "company" ADD COLUMN "showInMenu" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "company" DROP COLUMN "showInMenu"');
    await queryRunner.query(
      'ALTER TABLE "destination" DROP COLUMN "showInMenu"',
    );
  }
}
