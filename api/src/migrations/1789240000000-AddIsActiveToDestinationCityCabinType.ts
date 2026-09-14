import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToDestinationCityCabinType1789240000000
  implements MigrationInterface
{
  name = 'AddIsActiveToDestinationCityCabinType1789240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "destination" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "cabin_type" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cabin_type" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "destination" DROP COLUMN "isActive"`);
  }
}
