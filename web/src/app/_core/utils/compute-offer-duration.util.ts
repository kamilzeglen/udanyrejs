function parseCalendarDate(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString ?? '');

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function computeOfferDurationDays(startDate: string, endDate: string): number {
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);

  if (!start || !end) {
    return null;
  }

  const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return null;
  }

  return diffDays + 1;
}
