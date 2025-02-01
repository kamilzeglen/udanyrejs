import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDB1738411608381 implements MigrationInterface {
  name = 'InitDB1738411608381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email" ADD "offerURL" character varying(256)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email" DROP COLUMN "offerURL"`);
  }
}
