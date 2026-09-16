import { QueryRunner } from 'typeorm';
import { AddMenuVisibility1789290000000 } from './1789290000000-AddMenuVisibility';

describe('AddMenuVisibility1789290000000', () => {
  it('adds menu visibility columns without changing existing rows', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new AddMenuVisibility1789290000000().up({
      query,
    } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]) => sql);

    expect(statements).toContain(
      'ALTER TABLE "destination" ADD COLUMN "showInMenu" boolean NOT NULL DEFAULT false',
    );
    expect(statements).toContain(
      'ALTER TABLE "company" ADD COLUMN "showInMenu" boolean NOT NULL DEFAULT false',
    );
    expect(statements.some((sql) => sql.startsWith('UPDATE '))).toBe(false);
  });

  it('removes only the menu visibility columns on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new AddMenuVisibility1789290000000().down({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenNthCalledWith(
      1,
      'ALTER TABLE "company" DROP COLUMN "showInMenu"',
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      'ALTER TABLE "destination" DROP COLUMN "showInMenu"',
    );
  });
});
