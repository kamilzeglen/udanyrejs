import { matchCategoryIdsForRange } from './import-missing-categories.util';

describe('matchCategoryIdsForRange', () => {
  const categories = [
    { id: 'cat-majowka', startDate: '2026-04-25', endDate: '2026-05-04' },
    { id: 'cat-wakacje', startDate: '2026-06-25', endDate: '2026-08-31' },
    { id: 'cat-zima', startDate: '2026-12-01', endDate: '2027-02-28' },
    { id: 'cat-bez-dat', startDate: null, endDate: null },
  ];

  it('matches a term fully inside a category range', () => {
    const result = matchCategoryIdsForRange({ startDate: '2026-04-28', endDate: '2026-05-02' }, categories);

    expect(result).toEqual(['cat-majowka']);
  });

  it('matches a term that only partially overlaps a category range', () => {
    const result = matchCategoryIdsForRange({ startDate: '2026-05-01', endDate: '2026-05-10' }, categories);

    expect(result).toEqual(['cat-majowka']);
  });

  it('matches every category range the single term overlaps', () => {
    const result = matchCategoryIdsForRange({ startDate: '2026-11-15', endDate: '2026-12-05' }, categories);

    expect(result).toEqual(['cat-zima']);
  });

  it('ignores categories with no overlap', () => {
    const result = matchCategoryIdsForRange({ startDate: '2026-09-01', endDate: '2026-09-05' }, categories);

    expect(result).toEqual([]);
  });

  it('ignores categories missing a start or end date', () => {
    const result = matchCategoryIdsForRange({ startDate: '2026-01-01', endDate: '2027-12-31' }, categories);

    expect(result).not.toContain('cat-bez-dat');
  });
});
