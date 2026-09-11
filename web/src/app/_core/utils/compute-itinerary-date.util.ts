export function computeItineraryDate(termStartDate: string | null, dayNumber: number | null): Date | null {
  if (!termStartDate || !dayNumber) {
    return null;
  }

  const start = new Date(termStartDate);

  if (isNaN(start.getTime())) {
    return null;
  }

  const result = new Date(start);
  result.setDate(start.getDate() + dayNumber - 1);
  return result;
}
