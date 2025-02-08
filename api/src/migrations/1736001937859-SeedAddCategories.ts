import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddCategories1736001937859 implements MigrationInterface {
  name = 'SeedAddCategories1736001937859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "category" ("id", "name", "url", "isVisible", "createdById", "updatedById")
      VALUES 
        (uuid_generate_v4(), 'Last Minute', 'last-minute', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Majówka', 'long-week', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Wakacje', 'holidays', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Zima', 'winder', 'true', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "category"
      WHERE "name" IN ('Last Minute', 'Majówka', 'Wakacje', 'Zima');
    `);
  }
}
