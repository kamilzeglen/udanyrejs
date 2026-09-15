import { HideExistingCategories1789270000000 } from './1789270000000-HideExistingCategories';

describe('HideExistingCategories1789270000000', () => {
  it('hides every existing category', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) };
    const migration = new HideExistingCategories1789270000000();

    await migration.up(queryRunner as any);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      `CREATE TABLE IF NOT EXISTS "migration_178927_category_visibility" ("categoryId" uuid PRIMARY KEY, "isVisible" boolean NOT NULL)`,
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      2,
      `INSERT INTO "migration_178927_category_visibility" ("categoryId", "isVisible") SELECT "id", "isVisible" FROM "category" ON CONFLICT ("categoryId") DO NOTHING`,
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      3,
      `UPDATE "category" SET "isVisible" = false`,
    );
  });

  it('restores visibility when reverted', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) };
    const migration = new HideExistingCategories1789270000000();

    await migration.down(queryRunner as any);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      `UPDATE "category" SET "isVisible" = visibility."isVisible" FROM "migration_178927_category_visibility" visibility WHERE "category"."id" = visibility."categoryId"`,
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      2,
      `DROP TABLE "migration_178927_category_visibility"`,
    );
  });
});
