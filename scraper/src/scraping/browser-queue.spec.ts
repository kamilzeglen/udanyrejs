import { BrowserQueue } from './browser-queue';
import { ScraperConfig } from '../config';

const config: ScraperConfig = {
  port: 5010,
  internalToken: 'secret',
  allowedScrapeHosts: ['rejsy4you.pl'],
  maxTermsPerScrap: 100,
  minDelayMs: 20,
  maxDelayMs: 20,
  maxDiscoveryPagesPerHost: 5,
  listingRenderTimeoutMs: 0,
};

describe('BrowserQueue', () => {
  let queue: BrowserQueue;

  afterEach(async () => {
    await queue.close();
  });

  it('runs enqueued tasks one at a time, never overlapping', async () => {
    queue = new BrowserQueue(config);
    const activeCount = { current: 0, max: 0 };

    const makeTask = () => async () => {
      activeCount.current += 1;
      activeCount.max = Math.max(activeCount.max, activeCount.current);
      await new Promise((resolve) => setTimeout(resolve, 30));
      activeCount.current -= 1;
      return 'done';
    };

    const results = await Promise.all([
      queue.enqueue(makeTask()),
      queue.enqueue(makeTask()),
      queue.enqueue(makeTask()),
    ]);

    expect(results).toEqual(['done', 'done', 'done']);
    expect(activeCount.max).toBe(1);
  });

  it('propagates a task rejection without breaking the queue for the next task', async () => {
    queue = new BrowserQueue(config);

    const failingTask = queue.enqueue(async () => {
      throw new Error('boom');
    });
    const nextTask = queue.enqueue(async () => 'still works');

    await expect(failingTask).rejects.toThrow('boom');
    await expect(nextTask).resolves.toBe('still works');
  });

  it('waits the configured delay after a failing task too, not just after a successful one', async () => {
    const delayedConfig: ScraperConfig = {
      ...config,
      minDelayMs: 600,
      maxDelayMs: 600,
    };
    queue = new BrowserQueue(delayedConfig);

    // Uruchamia przeglądarkę PRZED pomiarem, żeby czas jej startu (rzędu
    // sekund) nie zagłuszył mierzonego opóźnienia (600ms).
    await queue.enqueue(async () => 'warmup');

    const beforeFailingTask = Date.now();
    const failingTask = queue.enqueue(async () => {
      throw new Error('boom');
    });
    let nextTaskStartedAt = 0;
    const nextTask = queue.enqueue(async () => {
      nextTaskStartedAt = Date.now();
      return 'done';
    });

    await expect(failingTask).rejects.toThrow('boom');
    await nextTask;

    expect(nextTaskStartedAt - beforeFailingTask).toBeGreaterThanOrEqual(450);
  });
});
