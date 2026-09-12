function toDateKey(value: string | Date): string {
  const parsed = new Date(value);
  return `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`;
}

// API zwraca terminy z bazy jako pełny ISO datetime w UTC (lokalna północ
// serwera przeliczona na UTC), a formularz trzyma datę wpisaną/zescrapowaną
// jako goły string typu "2026-10-04" (parsowany jako północ UTC) - dwie różne
// chwile czasu mimo tego samego dnia kalendarzowego. Porównanie przez
// getTime() nigdy by ich nie uznało za ten sam dzień poza strefą UTC, więc
// zamiast tego porównujemy kalendarzowy rok/miesiąc/dzień w LOKALNEJ strefie
// przeglądarki (ta sama strefa co serwer dla adminów w Polsce).
export function isSameCalendarDate(a: string | Date, b: string | Date): boolean {
  return toDateKey(a) === toDateKey(b);
}
