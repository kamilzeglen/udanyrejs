import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCabinTypeIsActive1789085094284 implements MigrationInterface {
  name = 'DropCabinTypeIsActive1789085094284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cabin_type" DROP COLUMN "isActive"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cabin_type" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }
}
