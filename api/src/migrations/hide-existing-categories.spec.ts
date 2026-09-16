import { HideExistingCategories1789270000000 } from './1789270000000-HideExistingCategories';

describe('HideExistingCategories1789270000000', () => {
  it('hides every existing category', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) };
    const migration = new HideExistingCategories1789270000000();

    await migration.up(queryRunner as any);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      `UPDATE "category" SET "isVisible" = false`,
    );
  });

  it('unhides every category when reverted', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) };
    const migration = new HideExistingCategories1789270000000();

    await migration.down(queryRunner as any);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      `UPDATE "category" SET "isVisible" = true`,
    );
  });
});
