import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const baseUrl = process.argv[2] || 'http://127.0.0.1:18086';
const buildDirectory = new URL('../dist/web/browser/', import.meta.url);
const files = await readdir(buildDirectory);
const javascript = files.find((file) => /^main-[\w]+\.js$/.test(file));
assert.ok(javascript, 'Production build is required');
const environment = await readFile(new URL('../src/environments/environment.prod.ts', import.meta.url), 'utf8');
const siteUrl = environment.match(/WEB_URL:\s*'([^']+)'/)[1];

async function request(path, options = {}) {
  return fetch(new URL(path, baseUrl), { redirect: 'manual', signal: AbortSignal.timeout(10000), ...options });
}

const robots = await request('/robots.txt');
assert.equal(robots.status, 200);
assert.match(robots.headers.get('content-type'), /text\/plain/);
assert.ok((await robots.text()).includes(`Sitemap: ${siteUrl}/sitemap.xml`));

const sitemap = await request('/sitemap.xml');
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get('content-type'), /xml/);
const locations = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(locations, ['/', '/contact', '/about-us', '/rules'].map((path) => `${siteUrl}${path}`));

for (const path of ['/assets/robots.txt', '/assets/sitemap.xml']) {
  const response = await request(path);
  assert.equal(response.status, 301);
  assert.equal(new URL(response.headers.get('location'), baseUrl).pathname, path.replace('/assets', ''));
}

for (const path of ['/', '/offers?page=2', '/offers/details/example']) {
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  assert.equal(response.headers.get('x-robots-tag'), null);
  assert.match(await response.text(), /<app-root><\/app-root>/);
}

for (const path of ['/admin/offers', '/login?redirect=admin', '/error', '/share/facebook/offer/term', '/contact/example']) {
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
}

const script = await request(`/${javascript}`, { headers: { 'Accept-Encoding': 'gzip' } });
assert.equal(script.status, 200);
assert.equal(script.headers.get('cache-control'), 'public, max-age=31536000, immutable');
assert.equal(script.headers.get('content-encoding'), 'gzip');
assert.match(script.headers.get('vary'), /Accept-Encoding/i);
assert.equal(await script.text(), await readFile(new URL(javascript, buildDirectory), 'utf8'));

const asset = await request('/assets/favicon.ico');
assert.equal(asset.status, 200);
assert.equal(asset.headers.get('cache-control'), 'public, max-age=3600, must-revalidate');
assert.ok(asset.headers.get('etag'));
const revalidated = await request('/assets/favicon.ico', { headers: { 'If-None-Match': asset.headers.get('etag') } });
assert.equal(revalidated.status, 304);

for (const path of ['/assets/missing.jpg', '/missing.js', '/missing-ABCDEFGH.js', '/missing.json']) {
  const response = await request(path);
  assert.equal(response.status, 404);
}

console.log('Serving checks passed: robots, sitemap, redirects, noindex, cache, gzip, ETag and missing assets.');
