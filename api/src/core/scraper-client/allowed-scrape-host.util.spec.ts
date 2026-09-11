import { isAllowedScrapeHost } from './allowed-scrape-host.util';

describe('isAllowedScrapeHost', () => {
  const allowedHosts = ['rejsy4you.pl'];

  it('allows an exact host match', () => {
    expect(
      isAllowedScrapeHost('https://rejsy4you.pl/rejs/1', allowedHosts),
    ).toBe(true);
  });

  it('rejects a different host', () => {
    expect(
      isAllowedScrapeHost('https://evil.example.com/rejs/1', allowedHosts),
    ).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(isAllowedScrapeHost('not-a-url', allowedHosts)).toBe(false);
  });
});
