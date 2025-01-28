import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddCategories1736001937859 implements MigrationInterface {
  name = 'SeedAddCategories1736001937859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "category" ("id", "name", "url", "isVisible", "createdById", "updatedById")
      VALUES 
        (uuid_generate_v4(), 'Rodzinne', 'family', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Popularne', 'popular', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "category"
      WHERE "name" IN ('Popularne', 'Promocje');
    `);
  }
}
