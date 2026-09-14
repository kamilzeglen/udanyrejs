import { QueryRunner } from 'typeorm';
import { AddUniqueNameConstraints1789250000000 } from './1789250000000-AddUniqueNameConstraints';

describe('unique name migration', () => {
  it('checks every table before altering schema', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await new AddUniqueNameConstraints1789250000000().up({
      query,
    } as unknown as QueryRunner);
    expect(
      query.mock.calls.slice(0, 3).every(([sql]) => sql.startsWith('SELECT')),
    ).toBe(true);
    expect(query.mock.calls.slice(3).map(([sql]) => sql)).toEqual([
      'ALTER TABLE "category" ADD CONSTRAINT "UQ_category_name" UNIQUE ("name")',
      'ALTER TABLE "destination" ADD CONSTRAINT "UQ_destination_name" UNIQUE ("name")',
      'ALTER TABLE "ship" ADD CONSTRAINT "UQ_ship_companyId_name" UNIQUE ("companyId", "name")',
    ]);
  });

  it('refuses duplicates without changing any data or schema', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ name: 'Duplicate' }]);
    await expect(
      new AddUniqueNameConstraints1789250000000().up({
        query,
      } as unknown as QueryRunner),
    ).rejects.toThrow('Migration blocked');
    expect(query.mock.calls.every(([sql]) => sql.startsWith('SELECT'))).toBe(
      true,
    );
  });

  it('removes only its three constraints on rollback', async () => {
    const query = jest.fn().mockResolvedValue([]);
    await new AddUniqueNameConstraints1789250000000().down({
      query,
    } as unknown as QueryRunner);
    expect(query.mock.calls).toHaveLength(3);
    expect(
      query.mock.calls.every(([sql]) => sql.includes('DROP CONSTRAINT')),
    ).toBe(true);
  });
});
