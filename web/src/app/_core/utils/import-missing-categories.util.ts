export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategoryWithDateRange {
  id: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

export function matchCategoryIdsForRange(termRange: DateRange, categories: CategoryWithDateRange[]): string[] {
  const termStart = new Date(termRange.startDate).getTime();
  const termEnd = new Date(termRange.endDate).getTime();

  return categories
    .filter((category) => !!category.startDate && !!category.endDate)
    .filter((category) => {
      const categoryStart = new Date(category.startDate).getTime();
      const categoryEnd = new Date(category.endDate).getTime();
      return termStart <= categoryEnd && termEnd >= categoryStart;
    })
    .map((category) => category.id);
}
