export interface NamedCity {
  id: string;
  name: string;
}

export function filterCitiesByFragment<T extends NamedCity>(cities: T[], fragment: string): T[] {
  const normalizedFragment = fragment.trim().toLowerCase();

  if (!normalizedFragment) {
    return cities;
  }

  return cities.filter((city) => city.name.toLowerCase().includes(normalizedFragment));
}
