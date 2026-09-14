import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTermCleanupSetting1789230000000 implements MigrationInterface {
  name = 'AddTermCleanupSetting1789230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "termCleanupEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "cleanupHour" smallint NOT NULL DEFAULT 3`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "cleanupMinute" smallint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" DROP COLUMN "cleanupMinute"`,
    );
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "cleanupHour"`);
    await queryRunner.query(
      `ALTER TABLE "settings" DROP COLUMN "termCleanupEnabled"`,
    );
  }
}
