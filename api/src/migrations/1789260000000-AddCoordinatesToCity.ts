import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoordinatesToCity1789260000000 implements MigrationInterface {
  name = 'AddCoordinatesToCity1789260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "city" ADD "latitude" numeric(9,6)`);
    await queryRunner.query(`ALTER TABLE "city" ADD "longitude" numeric(9,6)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "latitude"`);
  }
}
