export function isAllowedScrapeUrl(url: string, allowedHosts: string[]): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const protocolIsHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
  if (!protocolIsHttp) {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  return allowedHosts.some((allowedHost) => {
    const isExactMatch = hostname === allowedHost;
    const isSubdomain = hostname.endsWith(`.${allowedHost}`);
    return isExactMatch || isSubdomain;
  });
}
