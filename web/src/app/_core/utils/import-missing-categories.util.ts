export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategoryWithDateRange {
  id: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

export function resolveMissingCategoryIds(
  termRanges: DateRange[],
  categories: CategoryWithDateRange[],
  currentCategoryIds: string[],
): string[] {
  const matchedCategoryIds = new Set<string>();

  termRanges.forEach((term) => {
    const termStart = new Date(term.startDate).getTime();
    const termEnd = new Date(term.endDate).getTime();

    categories.forEach((category) => {
      if (!category.startDate || !category.endDate) {
        return;
      }

      const categoryStart = new Date(category.startDate).getTime();
      const categoryEnd = new Date(category.endDate).getTime();
      const overlaps = termStart <= categoryEnd && termEnd >= categoryStart;

      if (overlaps) {
        matchedCategoryIds.add(category.id);
      }
    });
  });

  return Array.from(matchedCategoryIds).filter((categoryId) => !currentCategoryIds.includes(categoryId));
}
