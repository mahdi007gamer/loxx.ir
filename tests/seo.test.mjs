import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function evaluate(relativePath, environment = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'process', code)(require, module, module.exports, { env: environment });
  return module.exports;
}
const seo = environment => evaluate('../apps/web/lib/seo.ts', environment);

test('only an explicitly configured public production site allows indexing', () => {
  assert.equal(seo({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://loxx.ir' }).indexingEnabled(), true);
  for (const environment of [
    { NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'https://loxx.ir' },
    { NODE_ENV: 'production' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://192.168.1.20' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://172.20.0.2' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://[::1]:3000' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://loxx.ir', NEXT_PUBLIC_ALLOW_INDEXING: 'false' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'not a URL' },
    { NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)' },
  ]) assert.equal(seo(environment).indexingEnabled(), false, JSON.stringify(environment));
});

test('page metadata has an absolute page canonical and safe structured data', () => {
  const helpers = seo({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://loxx.ir/' });
  const meta = helpers.pageMetadata('طراحی سایت', 'توضیح', '/services/company-website');
  assert.equal(meta.alternates.canonical, 'https://loxx.ir/services/company-website');
  assert.equal(meta.openGraph.url, meta.alternates.canonical);
  assert.equal(helpers.organizationSchema.telephone, '+989375302400');
  assert.equal(helpers.jsonLd({ title: '</script><script>alert(1)</script>' }).includes('<'), false);
});

test('service links resolve to distinct substantial service pages', () => {
  const { servicePages } = evaluate('../apps/web/lib/service-pages.ts');
  const slugs = new Set(servicePages.map(service => service.slug));
  assert.equal(slugs.size, 6);
  assert.equal(servicePages.length, slugs.size);
  for (const service of servicePages) {
    assert.ok(service.deliverables.length >= 4, service.slug);
    assert.ok(service.questions.length >= 3, service.slug);
    for (const slug of service.relatedSlugs) assert.ok(slugs.has(slug), `${service.slug} → ${slug}`);
  }
});
