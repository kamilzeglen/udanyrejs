import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWebClicksShareStat1740441194875 implements MigrationInterface {
  name = 'AddWebClicksShareStat1740441194875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "share_stats" ADD "webClicks" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "share_stats" DROP COLUMN "webClicks"`,
    );
  }
}
