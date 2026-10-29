import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, scryptSync } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const root = fileURLToPath(new URL('../', import.meta.url));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const settleWithin = (promise, milliseconds) => new Promise(resolve => {
  const timer = setTimeout(() => resolve(false), milliseconds);
  promise.then(() => { clearTimeout(timer); resolve(true); }, () => { clearTimeout(timer); resolve(true); });
});

test('the API refuses to start with a weak session signing secret', { timeout: 35000 }, () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/main.ts'], {
    cwd: path.join(root, 'apps/api'),
    env: { ...process.env, SESSION_SECRET: 'short', DATABASE_URL: 'file::memory:' },
    encoding: 'utf8', timeout: 30000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /SESSION_SECRET must be at least 32 characters/);
});

test('admin API persists content and pipeline changes while enforcing role and origin checks', { timeout: 120000 }, async t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'loxx-admin-test-'));
  fs.closeSync(fs.openSync(path.join(temporary, 'admin-test.db'), 'a'));
  const database = 'file:' + path.join(temporary, 'admin-test.db').replaceAll('\\', '/');
  const env = { ...process.env, DATABASE_URL: database, SESSION_SECRET: randomBytes(48).toString('hex'), WEB_ORIGIN: 'http://localhost:3000', NODE_ENV: 'development' };
  const db = new PrismaClient({ datasources: { db: { url: database } } });
  let child;
  let childClosed = false;
  t.after(async () => {
    if (child && !childClosed) {
      // Wait for close, not just exit, before deleting SQLite files on Windows.
      const closed = new Promise(resolve => child.once('close', resolve));
      if (child.exitCode === null) child.kill('SIGTERM');
      if (!await settleWithin(closed, 5000)) {
        if (process.platform === 'win32' && child.pid) {
          try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', timeout: 5000 }); } catch {}
        } else child.kill('SIGKILL');
        await settleWithin(closed, 5000);
      }
    }
    await db.$disconnect();
    fs.rmSync(temporary, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
  });
  execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--schema', path.join(root, 'apps/api/prisma/schema.prisma'), '--skip-generate'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], timeout: 45000, maxBuffer: 4 * 1024 * 1024 });
  const salt = randomBytes(16).toString('hex');
  const password = randomBytes(18).toString('base64url');
  await db.user.create({ data: { name: 'مدیر آزمون', email: 'admin@test.loxx', role: 'admin', passwordHash: salt + ':' + scryptSync(password, salt, 64).toString('hex') } });
  const port = await new Promise((resolve, reject) => {
    const server = net.createServer(); server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const value = server.address().port; server.close(() => resolve(value)); });
  });
  let output = '';
  child = spawn(process.execPath, ['--import', 'tsx', 'src/main.ts'], { cwd: path.join(root, 'apps/api'), env: { ...env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.once('close', () => { childClosed = true; });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { output += data; });
  const base = 'http://127.0.0.1:' + port + '/api/';
  let ready = false;
  const startupDeadline = Date.now() + 30000;
  while (Date.now() < startupDeadline) {
    try { ready = (await fetch(base + 'health', { signal: AbortSignal.timeout(1500) })).ok; } catch {}
    if (ready || child.exitCode !== null) break;
    await delay(100);
  }
  assert.ok(ready, 'API startup failed: ' + output.slice(-4000));
  async function request(url, { cookie, method = 'GET', body, origin = 'http://localhost:3000' } = {}) {
    return fetch(base + url, { method, signal: AbortSignal.timeout(12000), headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json' } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  }
  let adminCookie;
  let customerCookie;
  let leadId;
  let quoteId;
  let articleId;
  const post = { slug: 'integration-guide', title: 'راهنمای آزمون مدیریت', excerpt: 'خلاصه‌ای برای بررسی انتشار واقعی مقاله', body: '## هدف پروژه\n\nاین مقاله برای آزمون ذخیره و انتشار نوشته شده است.\n\n- خروجی مشخص\n- مرحله‌بندی روشن', category: 'راهنمای پروژه', coverImage: '/images/devices.webp', metaTitle: 'راهنمای مدیریت پروژه | LOXX', metaDescription: 'توضیح متای اختصاصی برای بررسی اتصال مدیریت و بلاگ.', keywords: 'طراحی سایت، برآورد پروژه', published: false };

  await t.test('anonymous users cannot read management data', async () => {
    for (const endpoint of ['admin/overview', 'admin/leads', 'admin/quotes', 'admin/articles', 'admin/users']) assert.equal((await request(endpoint)).status, 401, endpoint);
  });
  await t.test('registration cannot forge the admin role', async () => {
    const registered = await request('auth/register', { method: 'POST', body: { email: 'customer@test.loxx', password: 'customer-test-password', name: 'مشتری آزمون', role: 'admin' } });
    assert.equal(registered.status, 201);
    assert.equal((await registered.json()).role, 'customer');
    customerCookie = registered.headers.get('set-cookie').split(';')[0];
    assert.equal((await request('admin/overview', { cookie: customerCookie })).status, 403);
    const login = await request('auth/login', { method: 'POST', body: { email: 'admin@test.loxx', password } });
    assert.equal(login.status, 200);
    adminCookie = login.headers.get('set-cookie').split(';')[0];
  });
  await t.test('leads and quotes can be searched, paginated and advanced through the pipeline', async () => {
    const lead = await request('leads', { method: 'POST', cookie: customerCookie, body: { name: 'مشتری تست', phone: '09375302400', service: 'وب‌سایت شرکتی', message: 'مشاوره درباره سایت شرکتی' } });
    assert.equal(lead.status, 201); leadId = (await lead.json()).id;
    const quote = await request('quotes', { method: 'POST', cookie: customerCookie, body: { name: 'مشتری تست', phone: '09375302400', service: 'فروشگاه آنلاین', features: ['درگاه پرداخت', 'مدیریت سفارش'], budget: 'حدود ۸۰ میلیون تومان' } });
    assert.equal(quote.status, 201); quoteId = (await quote.json()).id;
    const listed = await request('admin/leads?paginated=1&pageSize=1&q=' + encodeURIComponent('مشتری'), { cookie: adminCookie });
    const list = await listed.json(); assert.equal(list.total, 1); assert.equal(list.items[0].id, leadId);
    assert.equal((await request('admin/leads/' + leadId, { method: 'PATCH', cookie: adminCookie, body: { status: 'contacted' } })).status, 200);
    assert.equal((await request('admin/quotes/' + quoteId, { method: 'PATCH', cookie: adminCookie, body: { status: 'in_progress' } })).status, 200);
    const own = await (await request('my/requests', { cookie: customerCookie })).json();
    assert.equal(own.leads[0].status, 'contacted'); assert.equal(own.quotes[0].status, 'in_progress');
    assert.equal((await request('admin/quotes/' + quoteId, { method: 'PATCH', cookie: adminCookie, body: { status: 'made-up' } })).status, 400);
  });
  await t.test('foreign origins cannot change an admin request', async () => {
    assert.equal((await request('admin/leads/' + leadId, { method: 'PATCH', cookie: adminCookie, origin: 'https://untrusted.invalid', body: { status: 'closed' } })).status, 403);
    assert.equal((await db.lead.findUnique({ where: { id: leadId } })).status, 'contacted');
  });
  await t.test('draft articles remain private and publication exposes the stored SEO fields', async () => {
    const created = await request('admin/articles', { method: 'POST', cookie: adminCookie, body: post });
    assert.equal(created.status, 201); articleId = (await created.json()).id;
    assert.equal((await request('articles/' + post.slug)).status, 404);
    assert.deepEqual(await (await request('articles')).json(), []);
    assert.equal((await request('admin/articles/' + articleId, { method: 'PATCH', cookie: customerCookie, body: { ...post, published: true } })).status, 403);
    assert.equal((await request('admin/articles/' + articleId, { method: 'PATCH', cookie: adminCookie, body: { ...post, published: true } })).status, 200);
    const article = await (await request('articles/' + post.slug)).json();
    assert.equal(article.body, post.body); assert.equal(article.metaTitle, post.metaTitle); assert.equal(article.metaDescription, post.metaDescription);
    const list = await (await request('articles')).json();
    assert.equal(list[0].slug, post.slug); assert.equal(list[0].category, post.category); assert.equal('body' in list[0], false);
  });
  await t.test('invalid slugs and duplicates are rejected during edits', async () => {
    assert.equal((await request('admin/articles', { method: 'POST', cookie: adminCookie, body: post })).status, 409);
    assert.equal((await request('admin/articles', { method: 'POST', cookie: adminCookie, body: { ...post, slug: '../invalid' } })).status, 400);
    await request('admin/articles', { method: 'POST', cookie: adminCookie, body: { ...post, slug: 'another-guide' } });
    assert.equal((await request('admin/articles/' + articleId, { method: 'PATCH', cookie: adminCookie, body: { ...post, slug: 'another-guide' } })).status, 409);
  });
  await t.test('the full 80000-character Persian body passes JSON parsing and the article limit is enforced', async () => {
    const longPost = { ...post, slug: 'long-persian-guide', body: 'م'.repeat(80000) };
    assert.ok(Buffer.byteLength(JSON.stringify(longPost), 'utf8') > 100 * 1024);
    const created = await request('admin/articles', { method: 'POST', cookie: adminCookie, body: longPost });
    assert.equal(created.status, 201);
    const stored = await created.json(); assert.equal(stored.body.length, 80000);
    assert.equal((await request('admin/articles/' + stored.id, { method: 'PATCH', cookie: adminCookie, body: { ...longPost, body: longPost.body + 'م' } })).status, 400);
    assert.equal((await request('admin/articles/' + stored.id, { method: 'DELETE', cookie: adminCookie })).status, 200);
  });
  await t.test('user records exclude password hashes and overview counts are real', async () => {
    const users = await (await request('admin/users', { cookie: adminCookie })).json();
    assert.equal(users.length, 2); assert.ok(users.every(user => !('passwordHash' in user)));
    const stats = await (await request('admin/overview', { cookie: adminCookie })).json();
    assert.equal(stats.leads, 1); assert.equal(stats.quotes, 1); assert.equal(stats.publishedArticles, 1); assert.equal(stats.drafts, 1);
  });
  await t.test('unpublishing and deleting a post remove it from public endpoints', async () => {
    assert.equal((await request('admin/articles/' + articleId, { method: 'PATCH', cookie: adminCookie, body: post })).status, 200);
    assert.equal((await request('articles/' + post.slug)).status, 404);
    assert.equal((await request('admin/articles/' + articleId, { method: 'DELETE', cookie: adminCookie })).status, 200);
    assert.equal(await db.article.findUnique({ where: { id: articleId } }), null);
  });
});
