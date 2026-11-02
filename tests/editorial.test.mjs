import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tsImport } from 'tsx/esm/api';

const articles = JSON.parse(readFileSync(new URL('../content/articles.json', import.meta.url)));
const map = JSON.parse(readFileSync(new URL('../content/keyword-map.json', import.meta.url)));
const { buildSitemapEntries } = await tsImport('../apps/web/lib/sitemap-entries.ts', import.meta.url);

test('every editorial keyword resolves to a substantial published guide and valid internal links', () => {
  assert.equal(map.length, 50);
  assert.equal(new Set(map.map(item => item.keyword)).size, 50);
  const slugs = new Set(articles.map(article => article.slug));
  const serviceSource = readFileSync(new URL('../apps/web/lib/service-pages.ts', import.meta.url), 'utf8');
  const services = new Set([...serviceSource.matchAll(/slug: '([^']+)'/g)].map(match => match[1]));
  for (const item of map) {
    const article = articles.find(article => article.slug === item.slug);
    assert.ok(article?.published, item.slug);
    assert.ok(article.body.trim().split(/\s+/u).length >= 500, item.slug);
    for (const match of article.body.matchAll(/\]\((\/[^\s)]+)\)/g)) {
      const url = match[1];
      if (url.startsWith('/blog/')) assert.ok(slugs.has(url.slice(6)), `${item.slug} → ${url}`);
      else if (url.startsWith('/services/')) assert.ok(services.has(url.slice(10)), `${item.slug} → ${url}`);
      else assert.ok(['/', '/blog', '/#contact', '/#pricing'].includes(url), url);
    }
  }
});

test('sitemap keeps article dates, updates listing dates, and excludes private routes', () => {
  const entries = buildSitemapEntries([{ slug: 'new-guide', createdAt: '2026-11-02T10:30:00.000Z', updatedAt: '2026-11-03T11:00:00.000Z' }]);
  assert.equal(entries.find(entry => entry.url.endsWith('/blog/new-guide')).lastModified, '2026-11-03T11:00:00.000Z');
  assert.equal(entries.find(entry => entry.url.endsWith('/blog')).lastModified, '2026-11-03T11:00:00.000Z');
  assert.equal(entries.find(entry => entry.url.endsWith('/privacy')).lastModified, '2026-10-29');
  assert.equal(entries.some(entry => /\/(admin|login|api)(\/|$)/.test(entry.url)), false);
  assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length);
});
