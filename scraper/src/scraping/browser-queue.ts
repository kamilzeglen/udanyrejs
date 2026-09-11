import { Browser, chromium, Page } from 'playwright';
import { ScraperConfig } from '../config';

function randomDelayMs(minDelayMs: number, maxDelayMs: number): number {
  if (maxDelayMs <= minDelayMs) {
    return minDelayMs;
  }

  return minDelayMs + Math.floor(Math.random() * (maxDelayMs - minDelayMs));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BrowserQueue {
  private browserPromise: Promise<Browser> | null = null;
  private tail: Promise<unknown> = Promise.resolve();

  public constructor(private readonly config: ScraperConfig) {}

  public enqueue<T>(task: (page: Page) => Promise<T>, label = 'task'): Promise<T> {
    const run = this.tail.catch(() => undefined).then(async () => {
      const startedAt = Date.now();
      console.log(`[scraper] ${label}: starting`);

      const browser = await this.getBrowser();
      const page = await browser.newPage();

      try {
        const result = await task(page);
        const elapsedMs = Date.now() - startedAt;
        console.log(`[scraper] ${label}: done (${elapsedMs}ms)`);

        const delayMs = randomDelayMs(this.config.minDelayMs, this.config.maxDelayMs);
        console.log(`[scraper] waiting ${delayMs}ms before the next request`);
        await wait(delayMs);

        return result;
      } catch (error) {
        console.error(`[scraper] ${label}: failed - ${(error as Error).message}`);
        throw error;
      } finally {
        await page.close();
      }
    });

    this.tail = run;
    return run;
  }

  public async close(): Promise<void> {
    if (!this.browserPromise) {
      return;
    }

    const browser = await this.browserPromise;
    await browser.close();
    this.browserPromise = null;
  }

  private getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      console.log('[scraper] launching headless Chromium');
      const channel = process.env.PLAYWRIGHT_CHANNEL;
      this.browserPromise = chromium.launch({ headless: true, channel: channel || undefined });
    }

    return this.browserPromise;
  }
}
