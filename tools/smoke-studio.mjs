import assert from 'node:assert/strict';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, closeSync, openSync, readFileSync, rmSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Production HTTP checks for CI after `npm run build`.
// The temporary database and generated credentials never touch the local setup.
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const apiDirectory = path.join(root, 'apps/api');
const apiPort = 4100; // The Next.js production rewrite defaults to this at build time.
const expectedArticleCount = 9;
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const within = (promise, milliseconds) => new Promise(resolve => {
  const timer = setTimeout(() => resolve(false), milliseconds);
  promise.then(() => { clearTimeout(timer); resolve(true); }, () => { clearTimeout(timer); resolve(true); });
});

async function freePort(preferred = 0) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(new Error('Smoke-check port is unavailable: ' + preferred + ' (' + error.code + '). No existing process was stopped.')));
    server.listen({ host: '127.0.0.1', port: preferred, exclusive: true }, () => {
      const value = server.address().port;
      server.close(error => error ? reject(error) : resolve(value));
    });
  });
}

function processTree(pid) {
  if (process.platform === 'win32') return [];
  const snapshot = spawnSync('ps', ['-eo', 'pid=,ppid=,pgid='], { encoding: 'utf8', timeout: 5000 });
  if (snapshot.status !== 0) return [];
  const rows = snapshot.stdout.trim().split('\n').map(line => {
    const [id, parent, group] = line.trim().split(/\s+/).map(Number);
    return { id, parent, group };
  });
  const descendants = new Set([pid]);
  let changed;
  do {
    changed = false;
    for (const row of rows) if (descendants.has(row.parent) && !descendants.has(row.id)) {
      descendants.add(row.id); changed = true;
    }
  } while (changed);
  return rows.filter(row => descendants.has(row.id));
}

async function main() {
  for (const file of ['apps/api/dist/main.js', 'apps/web/.next/BUILD_ID']) {
    if (!existsSync(path.join(root, file))) throw new Error('A production build is required before this check: missing ' + file);
  }
  const curated = JSON.parse(readFileSync(path.join(root, 'content/articles.json'), 'utf8')).filter(post => post.published);
  assert.equal(curated.length, expectedArticleCount, 'The release should contain nine published editorial articles.');
  await freePort(apiPort);
  let webPort = await freePort();
  while (webPort === apiPort || webPort === 3000) webPort = await freePort();
  const webOrigin = 'http://127.0.0.1:' + webPort;
  const directApi = 'http://127.0.0.1:' + apiPort;
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'loxx-production-smoke-'));
  const databaseFile = path.join(temporary, 'studio.db');
  closeSync(openSync(databaseFile, 'a'));
  const environment = {
    ...process.env,
    DATABASE_URL: 'file:' + databaseFile.replaceAll('\\', '/'),
    ADMIN_EMAIL: 'ci-' + randomBytes(6).toString('hex') + '@loxx.invalid',
    ADMIN_PASSWORD: randomBytes(24).toString('base64url'),
    SESSION_SECRET: randomBytes(48).toString('hex'),
    API_PORT: String(apiPort),
    API_URL: directApi,
    // Deliberately disagree with --port to catch a dropped forwarded CLI port.
    PORT: '3000',
    WEB_PORT: '3000',
    WEB_ORIGIN: webOrigin,
    NEXT_TELEMETRY_DISABLED: '1',
  };
  let runner;
  let runnerClosed = false;
  let runnerError;
  let runnerDone;
  let output = '';
  let watcher;
  let stopping = false;
  let cleanupTask;
  const ownedGroups = new Set();
  const rememberProcesses = () => {
    if (!runner?.pid) return;
    for (const child of processTree(runner.pid)) if (child.group > 0) ownedGroups.add(child.group);
  };
  function cleanup() {
    if (cleanupTask) return cleanupTask;
    stopping = true;
    cleanupTask = (async () => {
      clearInterval(watcher);
      rememberProcesses();
      if (runner && !runnerClosed) runner.kill('SIGTERM');
      // run-studio owns detached npm groups; record and stop those groups as well.
      if (process.platform === 'win32') {
        if (runner?.pid && !runnerClosed) spawnSync('taskkill', ['/PID', String(runner.pid), '/T', '/F'], { stdio: 'ignore', timeout: 10000 });
      } else {
        for (const group of ownedGroups) {
          try { process.kill(-group, 'SIGTERM'); } catch {}
        }
      }
      if (runnerDone) await within(runnerDone, 8000);
      if (process.platform !== 'win32') {
        // Also stop a descendant which outlived its npm parent or closed stdout early.
        for (const group of ownedGroups) {
          try { process.kill(-group, 'SIGKILL'); } catch {}
        }
        if (runnerDone && !runnerClosed) await within(runnerDone, 3000);
      }
      rmSync(temporary, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
    })();
    return cleanupTask;
  }
  const onSignal = () => {
    void cleanup().finally(() => { process.exitCode = 1; });
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    console.log('[SMOKE] Preparing an isolated SQLite database and nine seeded articles...');
    const schemaOutput = execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--schema', path.join(apiDirectory, 'prisma/schema.prisma'), '--skip-generate'], {
      cwd: root, env: environment, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    process.stdout.write(schemaOutput);
    const seedOutput = execFileSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
      cwd: apiDirectory, env: environment, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    process.stdout.write(seedOutput);
    console.log('[SMOKE] Starting the compiled API and Next.js production server...');
    runner = spawn(process.execPath, ['tools/run-studio.mjs', 'start', '--port', String(webPort)], {
      cwd: root, env: environment, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (runner.pid && process.platform !== 'win32') ownedGroups.add(runner.pid);
    runnerDone = new Promise(resolve => {
      runner.once('error', error => { runnerError = error; resolve(); });
      runner.once('close', () => { runnerClosed = true; resolve(); });
    });
    for (const stream of [runner.stdout, runner.stderr]) stream.on('data', chunk => {
      const text = chunk.toString();
      output = (output + text).slice(-128 * 1024);
      process.stdout.write(text);
    });
    watcher = setInterval(rememberProcesses, 500);
    watcher.unref();
    const deadline = Date.now() + 90000;
    let ready = false;
    while (Date.now() < deadline && !runnerClosed && !runnerError && !stopping) {
      try {
        const [api, web] = await Promise.all([
          fetch(directApi + '/api/health', { signal: AbortSignal.timeout(2000) }),
          fetch(webOrigin, { signal: AbortSignal.timeout(5000) }),
        ]);
        await Promise.all([api.arrayBuffer(), web.arrayBuffer()]);
        if (api.ok && web.ok) { ready = true; break; }
      } catch {}
      await pause(500);
    }
    if (!ready) throw new Error('Production services did not become ready.' + (runnerError ? ' ' + runnerError.message : ''));
    rememberProcesses();
    const request = (url, init = {}) => fetch(webOrigin + url, { ...init, signal: AbortSignal.timeout(15000), redirect: 'error' });
    async function htmlRoute(url, text) {
      const response = await request(url);
      assert.equal(response.status, 200, url + ' HTTP status');
      assert.match(response.headers.get('content-type') || '', /text\/html/i, url + ' content type');
      const html = await response.text();
      assert.match(html, /<h1(?:\s|>)/i, url + ' has a server-rendered heading');
      if (text) assert.ok(html.includes(text), url + ' contains its real page content');
      console.log('[SMOKE] 200 ' + url);
    }
    await htmlRoute('/');
    await htmlRoute('/blog', curated[0].title);
    await htmlRoute('/blog/' + curated[0].slug, curated[0].title);
    await htmlRoute('/services/company-website', 'طراحی سایت شرکتی');
    await htmlRoute('/work/mehrad-kavir', 'مهراد کویر');
    const healthResponse = await request('/api/health');
    assert.equal(healthResponse.status, 200, 'Next.js must proxy API health');
    assert.equal((await healthResponse.json()).ok, true);
    const listResponse = await request('/api/articles');
    assert.equal(listResponse.status, 200);
    const articles = await listResponse.json();
    assert.equal(articles.length, expectedArticleCount, 'The proxied API exposes nine stored published articles.');
    for (const post of curated) assert.ok(articles.some(article => article.slug === post.slug), 'Seeded article is present: ' + post.slug);
    const storedResponse = await request('/api/articles/' + curated[0].slug);
    assert.equal(storedResponse.status, 200);
    const stored = await storedResponse.json();
    assert.equal(stored.body, curated[0].body, 'The API serves the complete seeded article body.');
    assert.equal(stored.metaTitle, curated[0].metaTitle);
    const sitemapResponse = await request('/sitemap.xml');
    assert.equal(sitemapResponse.status, 200);
    const sitemap = await sitemapResponse.text();
    assert.match(sitemap, /<urlset\b/);
    for (const post of curated) assert.ok(sitemap.includes('/blog/' + post.slug), 'Sitemap includes ' + post.slug);
    assert.ok(sitemap.includes('/services/company-website'));
    assert.ok(sitemap.includes('/work/mehrad-kavir'));
    assert.equal(sitemap.includes('/admin'), false, 'Private admin routes stay out of the sitemap.');
    const privateResponse = await request('/api/admin/overview');
    assert.equal(privateResponse.status, 401, 'Anonymous admin API access must be denied.');
    await privateResponse.arrayBuffer();
    const leadResponse = await request('/api/leads', {
      method: 'POST', headers: { Origin: webOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'آزمون خودکار انتشار', phone: '09000000000', service: 'بررسی نسخه تولید', message: 'این درخواست فقط در دیتابیس موقت آزمون ثبت می‌شود.' }),
    });
    assert.equal(leadResponse.status, 201, 'The real contact endpoint accepts a valid proxied request.');
    const lead = await leadResponse.json();
    assert.equal(typeof lead.id, 'string'); assert.equal(lead.status, 'new');
    console.log('[SMOKE] PASS: five production pages, sitemap, API proxy, nine full articles, private admin rejection and real lead creation.');
  } catch (error) {
    if (output) console.error('\n[SMOKE] Recent production-server output:\n' + output.slice(-12000));
    throw error;
  } finally {
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
    await cleanup();
  }
}

main().catch(error => {
  console.error('[SMOKE] FAIL:', error.stack || error.message);
  process.exitCode = 1;
});
