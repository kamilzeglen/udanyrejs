import { resolveMissingCategoryIds } from './import-missing-categories.util';

describe('resolveMissingCategoryIds', () => {
  const categories = [
    { id: 'cat-majowka', startDate: '2026-04-25', endDate: '2026-05-04' },
    { id: 'cat-wakacje', startDate: '2026-06-25', endDate: '2026-08-31' },
    { id: 'cat-zima', startDate: '2026-12-01', endDate: '2027-02-28' },
    { id: 'cat-bez-dat', startDate: null, endDate: null },
  ];

  it('matches a term fully inside a category range', () => {
    const result = resolveMissingCategoryIds([{ startDate: '2026-04-28', endDate: '2026-05-02' }], categories, []);

    expect(result).toEqual(['cat-majowka']);
  });

  it('matches a term that only partially overlaps a category range', () => {
    const result = resolveMissingCategoryIds([{ startDate: '2026-05-01', endDate: '2026-05-10' }], categories, []);

    expect(result).toEqual(['cat-majowka']);
  });

  it('merges categories matched from multiple terms without duplicates', () => {
    const result = resolveMissingCategoryIds(
      [
        { startDate: '2026-04-28', endDate: '2026-05-02' },
        { startDate: '2026-07-01', endDate: '2026-07-10' },
      ],
      categories,
      [],
    );

    expect(result.sort()).toEqual(['cat-majowka', 'cat-wakacje'].sort());
  });

  it('excludes category ids already present in currentCategoryIds', () => {
    const result = resolveMissingCategoryIds([{ startDate: '2026-04-28', endDate: '2026-05-02' }], categories, [
      'cat-majowka',
    ]);

    expect(result).toEqual([]);
  });

  it('ignores categories with no overlap', () => {
    const result = resolveMissingCategoryIds([{ startDate: '2026-09-01', endDate: '2026-09-05' }], categories, []);

    expect(result).toEqual([]);
  });

  it('ignores categories missing a start or end date', () => {
    const result = resolveMissingCategoryIds([{ startDate: '2026-01-01', endDate: '2027-12-31' }], categories, []);

    expect(result).not.toContain('cat-bez-dat');
  });

  it('returns an empty array when there are no terms', () => {
    const result = resolveMissingCategoryIds([], categories, []);

    expect(result).toEqual([]);
  });
});
