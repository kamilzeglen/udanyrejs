import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUser1789033870824 implements MigrationInterface {
  name = 'AddRefreshTokenToUser1789033870824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "refreshTokenHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "refreshTokenExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "refreshTokenHash"`,
    );
  }
}
