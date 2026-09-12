// Porównuje daty terminów jako KALENDARZOWY dzień, nie jako dokładny
// znacznik czasu - kolumny startDate/endDate to "TIMESTAMP" bez strefy, więc
// Postgres zwraca je jako lokalną północ, a świeżo zescrapowany string typu
// "2026-10-04" JS paruje jako północ UTC. Porównanie przez .getTime() różni
// się wtedy o przesunięcie strefy serwera i nigdy nie uzna tego za ten sam
// dzień, mimo że to ta sama data - stąd błędne duplikaty terminów.
function toDateKey(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameCalendarDate(
  a: string | Date,
  b: string | Date,
): boolean {
  return toDateKey(a) === toDateKey(b);
}

export interface DateRange {
  startDate: string | Date;
  endDate: string | Date;
}

export function isSameDateRange(a: DateRange, b: DateRange): boolean {
  return (
    isSameCalendarDate(a.startDate, b.startDate) &&
    isSameCalendarDate(a.endDate, b.endDate)
  );
}
