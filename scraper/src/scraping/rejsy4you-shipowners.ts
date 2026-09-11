export interface Rejsy4youShipowner {
  id: number;
  name: string;
}

// Hardcodowana lista armator -> ID na rejsy4you (parametr `shipowner` w URL
// listingu /rejsy). Zebrana ręcznie z publicznej listy armatorów rejsy4you -
// wewnętrzne API strony, które zwraca tę listę jako JSON, odrzuca zapytania
// spoza własnego frontendu strony, więc nie pobieramy jej programowo.
export const REJSY4YOU_SHIPOWNERS: Rejsy4youShipowner[] = [
  { id: 31, name: 'Aida Cruises' },
  { id: 13, name: 'Azamara Club Cruises' },
  { id: 17, name: 'Carnival Cruise Lines' },
  { id: 10, name: 'Celebrity Cruises' },
  { id: 4, name: 'Celestyal Cruises' },
  { id: 2, name: 'Costa Cruises' },
  { id: 40, name: 'CroisiEurope' },
  { id: 5, name: 'Disney Cruise Line' },
  { id: 61, name: 'Elixir Boutique Cruises' },
  { id: 66, name: 'Explora Journeys' },
  { id: 16, name: 'Holland America Line' },
  { id: 63, name: 'Mein Schiff - TUI Cruises' },
  { id: 6, name: 'MSC Cruises' },
  { id: 47, name: 'nicko cruises' },
  { id: 1, name: 'Norwegian Cruise Line' },
  { id: 28, name: 'Oceania Cruises' },
  { id: 15, name: 'Paul Gauguin Cruises' },
  { id: 12, name: 'Ponant - Yacht Cruises & Expeditions' },
  { id: 20, name: 'Princess Cruises' },
  { id: 18, name: 'Regent Seven Seas Cruises' },
  { id: 11, name: 'Royal Caribbean Cruise Line' },
  { id: 26, name: 'Seabourn' },
  { id: 25, name: 'Silversea Cruises' },
  { id: 8, name: 'Star Clippers' },
  { id: 75, name: 'Swan Hellenic' },
  { id: 19, name: 'Variety Cruises' },
  { id: 37, name: 'Viking Cruises' },
  { id: 55, name: 'Virgin Voyages' },
];

export function findShipownerId(
  name: string,
  shipowners: Rejsy4youShipowner[] = REJSY4YOU_SHIPOWNERS,
): number | null {
  const normalizedQuery = name.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  const exactMatch = shipowners.find((shipowner) => shipowner.name.trim().toLowerCase() === normalizedQuery);
  if (exactMatch) {
    return exactMatch.id;
  }

  const substringMatches = shipowners.filter((shipowner) => {
    const normalizedName = shipowner.name.trim().toLowerCase();
    return normalizedQuery.includes(normalizedName) || normalizedName.includes(normalizedQuery);
  });

  if (substringMatches.length === 1) {
    return substringMatches[0].id;
  }

  return null;
}
