import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropIsActiveFromOffer1789210000000 implements MigrationInterface {
  name = 'DropIsActiveFromOffer1789210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "isActive"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }
}
