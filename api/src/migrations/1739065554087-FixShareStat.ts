import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixShareStat1739065554087 implements MigrationInterface {
  name = 'FixShareStat1739065554087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "sharedStatId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer" ADD "sharedStatId" uuid`);
  }
}
