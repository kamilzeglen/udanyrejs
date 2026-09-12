import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToOfferTerm1789200000000 implements MigrationInterface {
  name = 'AddIsActiveToOfferTerm1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer_term" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer_term" DROP COLUMN "isActive"`);
  }
}
