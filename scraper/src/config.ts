export interface ScraperConfig {
  port: number;
  internalToken: string;
  allowedScrapeHosts: string[];
  maxTermsPerScrap: number;
  minDelayMs: number;
  maxDelayMs: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): ScraperConfig {
  const allowedScrapeHosts = requireEnv('ALLOWED_SCRAPE_HOSTS')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length > 0);

  return {
    port: Number(process.env.PORT ?? 5010),
    internalToken: requireEnv('INTERNAL_TOKEN'),
    allowedScrapeHosts,
    maxTermsPerScrap: Number(process.env.MAX_TERMS_PER_SCRAP ?? 100),
    minDelayMs: Number(process.env.MIN_DELAY_MS ?? 2000),
    maxDelayMs: Number(process.env.MAX_DELAY_MS ?? 5000),
  };
}
