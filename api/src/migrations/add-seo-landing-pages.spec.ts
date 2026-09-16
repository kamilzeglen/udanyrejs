import { QueryRunner } from 'typeorm';
import { AddSeoLandingPages1789280000000 } from './1789280000000-AddSeoLandingPages';

describe('AddSeoLandingPages1789280000000', () => {
  it('adds nullable SEO fields and unique slugs without modifying existing records', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new AddSeoLandingPages1789280000000().up({
      query,
    } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]) => sql);

    expect(statements).toContain(
      'ALTER TABLE "destination" ADD COLUMN "slug" character varying(120)',
    );
    expect(statements).toContain(
      'ALTER TABLE "company" ADD COLUMN "slug" character varying(120)',
    );
    expect(statements).toContain(
      'ALTER TABLE "destination" ADD CONSTRAINT "UQ_destination_slug" UNIQUE ("slug")',
    );
    expect(statements).toContain(
      'ALTER TABLE "company" ADD CONSTRAINT "UQ_company_slug" UNIQUE ("slug")',
    );
    expect(statements.some((sql) => sql.startsWith('UPDATE '))).toBe(false);
  });

  it('removes only SEO landing page schema on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new AddSeoLandingPages1789280000000().down({
      query,
    } as unknown as QueryRunner);

    const statements = query.mock.calls.map(([sql]) => sql);

    expect(statements).toContain(
      'ALTER TABLE "destination" DROP CONSTRAINT "UQ_destination_slug"',
    );
    expect(statements).toContain(
      'ALTER TABLE "company" DROP CONSTRAINT "UQ_company_slug"',
    );
    expect(statements.some((sql) => sql.startsWith('DELETE '))).toBe(false);
  });
});
