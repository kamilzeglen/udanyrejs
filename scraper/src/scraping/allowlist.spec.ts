import { isAllowedScrapeUrl } from './allowlist';

describe('isAllowedScrapeUrl', () => {
  const allowedHosts = ['rejsy4you.pl'];

  it('allows an exact host match', () => {
    expect(
      isAllowedScrapeUrl(
        'https://rejsy4you.pl/rejs/93096_x_208990',
        allowedHosts,
      ),
    ).toBe(true);
  });

  it('allows a subdomain of an allowed host', () => {
    expect(
      isAllowedScrapeUrl(
        'https://www.rejsy4you.pl/rejs/93096_x_208990',
        allowedHosts,
      ),
    ).toBe(true);
  });

  it('rejects a different host', () => {
    expect(
      isAllowedScrapeUrl(
        'https://evil.example.com/rejs/93096_x_208990',
        allowedHosts,
      ),
    ).toBe(false);
  });

  it('rejects a host that merely contains the allowed host as a substring', () => {
    expect(
      isAllowedScrapeUrl('https://rejsy4you.pl.evil.com/x', allowedHosts),
    ).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(isAllowedScrapeUrl('not-a-url', allowedHosts)).toBe(false);
  });

  it('rejects a non-http(s) protocol', () => {
    expect(isAllowedScrapeUrl('file:///etc/passwd', allowedHosts)).toBe(false);
  });
});
