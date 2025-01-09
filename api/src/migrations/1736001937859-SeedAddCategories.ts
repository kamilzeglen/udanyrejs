import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAddCategories1736001937859 implements MigrationInterface {
  name = 'SeedAddCategories1736001937859'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "category" ("id", "name", "url")
      VALUES 
        (uuid_generate_v4(), 'Popularne', 'popular'),
        (uuid_generate_v4(), 'Nowe', 'new')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "category"
      WHERE "name" IN ('Popularne', 'Nowe');
    `);
  }

}
