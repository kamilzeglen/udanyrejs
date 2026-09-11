import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceUrlToOfferTerm1789081041969
  implements MigrationInterface
{
  name = 'AddSourceUrlToOfferTerm1789081041969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer_term" ADD "sourceUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer_term" DROP COLUMN "sourceUrl"`);
  }
}
