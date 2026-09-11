export interface FuzzyMatchCandidate {
  id: string;
  name: string;
}

export function findBestMatch(
  query: string,
  candidates: FuzzyMatchCandidate[],
): string | null {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  const exactMatch = candidates.find(
    (candidate) => candidate.name.trim().toLowerCase() === normalizedQuery,
  );
  if (exactMatch) {
    return exactMatch.id;
  }

  const substringMatches = candidates.filter((candidate) => {
    const normalizedName = candidate.name.trim().toLowerCase();
    return (
      normalizedQuery.includes(normalizedName) ||
      normalizedName.includes(normalizedQuery)
    );
  });

  if (substringMatches.length === 1) {
    return substringMatches[0].id;
  }

  return null;
}
