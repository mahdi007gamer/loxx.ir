import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsImport } from 'tsx/esm/api';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { getPublishedArticles, getArticleBySlug } = await tsImport('../apps/web/lib/posts.ts', import.meta.url);
const { ArticleBody, parseArticle } = await tsImport('../apps/web/components/ArticleBody.tsx', import.meta.url);
const curated = JSON.parse(fs.readFileSync(new URL('../content/articles.json', import.meta.url), 'utf8'));

test('healthy API publication state overrides the curated fallback', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([]));
  assert.deepEqual(await getPublishedArticles(), []);
});

test('a healthy article 404 never resurrects an unpublished seeded post', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }));
  assert.equal(await getArticleBySlug('website-brief'), null);
});

test('live editorial changes are returned without a cache', async t => {
  let options;
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    options = init;
    return Response.json({ ...curated[0], title: 'عنوان ویرایش‌شده مدیر', body: 'محتوای جدید مدیر' });
  });
  const article = await getArticleBySlug('website-brief');
  assert.equal(article.title, 'عنوان ویرایش‌شده مدیر');
  assert.equal(article.body, 'محتوای جدید مدیر');
  assert.equal(options.cache, 'no-store');
});

test('network outages use the complete curated content but unknown slugs stay missing', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network unavailable'); });
  assert.equal((await getPublishedArticles()).length, 9);
  assert.ok((await getArticleBySlug('website-brief')).body.split(/\s+/u).length > 700);
  assert.equal(await getArticleBySlug('missing-article'), null);
});

test('article rendering escapes raw HTML and drops executable and protocol-relative links', () => {
  const body = '<script>alert(1)</script>\n\n[bad](javascript:alert) [outside](//evil.example) [safe](/#contact) [reference](https://developers.google.com/search/)';
  const html = renderToStaticMarkup(createElement(ArticleBody, { blocks: parseArticle(body) }));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes('href="//evil'));
  assert.ok(html.includes('href="/#contact"'));
  assert.ok(html.includes('href="https://developers.google.com/search/"'));
});

test('structured article headings create unique navigable anchors', () => {
  const blocks = parseArticle('## مسیر\n\nمتن\n\n## مسیر\n\n- یک\n- دو\n\n| الف | ب |\n| --- | --- |\n| ۱ | ۲ |');
  assert.deepEqual(blocks.filter(block => block.type === 'heading').map(block => block.id), ['section-1', 'section-2']);
  assert.equal(blocks.filter(block => block.type === 'list')[0].items.length, 2);
  const html = renderToStaticMarkup(createElement(ArticleBody, { blocks }));
  assert.ok(html.includes('id="section-2"'));
  assert.ok(html.includes('<thead>'));
});
