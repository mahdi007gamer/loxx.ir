import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const content = fs.readFileSync(new URL('../START-LOXX.bat', import.meta.url), 'utf8');
const marker = '// LOXX_EMBEDDED_NODE';
const holder = { exports: {} };
new Function('require', 'module', content.slice(content.lastIndexOf(marker) + marker.length))(require, holder);
const { syncRepository, assertPortsFree } = holder.exports;
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (root, file, value) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), value);
};
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'loxx-launcher-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const upstream = path.join(base, 'upstream');
  const remote = path.join(base, 'remote.git');
  const local = path.join(base, 'local project ! unicode-مهدی');
  const state = path.join(base, 'state');
  fs.mkdirSync(upstream);
  git(upstream, 'init', '--initial-branch=main');
  git(upstream, 'config', 'user.name', 'Launcher Test');
  git(upstream, 'config', 'user.email', 'test@loxx.invalid');
  git(upstream, 'config', 'commit.gpgsign', 'false');
  write(upstream, 'package.json', '{"name":"loxx-platform"}\n');
  write(upstream, '.gitignore', '.env\n*.db\nLOCAL_LOGIN.txt\nnode_modules/\n.next/\ndist/\n');
  write(upstream, 'page.txt', 'original');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'original');
  git(base, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(base, 'clone', remote, local);
  git(local, 'config', 'user.name', 'Local Test');
  git(local, 'config', 'user.email', 'local@loxx.invalid');
  git(local, 'config', 'commit.gpgsign', 'false');
  const update = () => {
    write(upstream, 'page.txt', 'latest from GitHub');
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'latest landing');
    git(upstream, 'push', 'origin', 'main');
    return git(upstream, 'rev-parse', 'HEAD');
  };
  const messages = [];
  const sync = () => syncRepository(local, state, m => messages.push(m), remote);
  return { base, upstream, remote, local, state, update, sync, messages };
}

test('a clean checkout fetches main, verifies the exact commit and can sync twice', t => {
  const f = fixture(t);
  const latest = f.update();
  assert.equal(f.sync().after, latest);
  assert.equal(f.sync().after, latest);
  assert.equal(fs.readFileSync(path.join(f.local, 'page.txt'), 'utf8'), 'latest from GitHub');
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.state, 'version.json'))).commit, latest);
  assert.ok(f.messages.some(m => m.endsWith('[MATCH]')));
});

test('dirty tracked and untracked files are recoverable while latest source runs', t => {
  const f = fixture(t);
  const latest = f.update();
  write(f.local, 'page.txt', 'my local edits');
  write(f.local, 'new-design.txt', 'untracked work');
  write(f.local, 'apps/api/.env', 'PRIVATE_CONFIG=unchanged');
  write(f.local, 'apps/api/prisma/dev.db', 'private database');
  write(f.local, 'LOCAL_LOGIN.txt', 'private login');
  assert.equal(f.sync().after, latest);
  assert.equal(git(f.local, 'show', 'stash@{0}:page.txt'), 'my local edits');
  assert.equal(git(f.local, 'show', 'stash@{0}^3:new-design.txt'), 'untracked work');
  assert.equal(git(f.local, 'status', '--porcelain'), '');
  for (const [file, value] of [['apps/api/.env', 'PRIVATE_CONFIG=unchanged'], ['apps/api/prisma/dev.db', 'private database'], ['LOCAL_LOGIN.txt', 'private login']]) {
    assert.equal(fs.readFileSync(path.join(f.local, file), 'utf8'), value);
  }
});

test('divergent local commits and a different main head both retain backup branches', t => {
  const f = fixture(t);
  write(f.local, 'local-main.txt', 'local main work');
  git(f.local, 'add', '.');
  git(f.local, 'commit', '-m', 'local main work');
  const previousMain = git(f.local, 'rev-parse', 'HEAD');
  git(f.local, 'checkout', '-b', 'feature');
  write(f.local, 'feature.txt', 'feature work');
  git(f.local, 'add', '.');
  git(f.local, 'commit', '-m', 'feature work');
  const previousFeature = git(f.local, 'rev-parse', 'HEAD');
  const latest = f.update();
  assert.equal(f.sync().after, latest);
  const refs = git(f.local, 'for-each-ref', '--format=%(objectname) %(refname)', 'refs/heads/');
  assert.match(refs, new RegExp(previousMain + ' refs/heads/loxx-main-backup-'));
  assert.match(refs, new RegExp(previousFeature + ' refs/heads/loxx-backup-'));
  assert.equal(git(f.local, 'branch', '--show-current'), 'main');
});

test('a ZIP install adopts Git, removes obsolete source and preserves runtime data', t => {
  const f = fixture(t);
  fs.rmSync(path.join(f.local, '.git'), { recursive: true });
  write(f.local, 'obsolete-route.tsx', 'old route');
  write(f.local, 'apps/api/.env', 'PRIVATE_CONFIG=zip');
  write(f.local, 'apps/api/prisma/dev.db', 'zip database');
  write(f.local, 'LOCAL_LOGIN.txt', 'zip login');
  const latest = f.update();
  assert.equal(f.sync().after, latest);
  assert.equal(fs.existsSync(path.join(f.local, 'obsolete-route.tsx')), false);
  assert.equal(fs.readFileSync(path.join(f.local, 'apps/api/.env'), 'utf8'), 'PRIVATE_CONFIG=zip');
  assert.equal(fs.readFileSync(path.join(f.local, 'apps/api/prisma/dev.db'), 'utf8'), 'zip database');
  assert.equal(fs.readFileSync(path.join(f.local, 'LOCAL_LOGIN.txt'), 'utf8'), 'zip login');
  const [backup] = fs.readdirSync(path.join(f.state, 'backups'));
  assert.equal(fs.readFileSync(path.join(f.state, 'backups', backup, 'obsolete-route.tsx'), 'utf8'), 'old route');
  assert.equal(git(f.local, 'ls-files', 'apps/api/.env', 'apps/api/prisma/dev.db', 'LOCAL_LOGIN.txt'), '');
});

test('an unavailable remote fails without stashing or modifying local source', t => {
  const f = fixture(t);
  write(f.local, 'page.txt', 'unsaved work');
  const head = git(f.local, 'rev-parse', 'HEAD');
  fs.renameSync(f.remote, f.remote + '-offline');
  assert.throws(f.sync, /Git fetch failed/);
  assert.equal(git(f.local, 'rev-parse', 'HEAD'), head);
  assert.equal(fs.readFileSync(path.join(f.local, 'page.txt'), 'utf8'), 'unsaved work');
  assert.equal(git(f.local, 'stash', 'list'), '');
  assert.equal(f.messages.filter(m => /Fetch attempt/.test(m)).length, 3);
});

test('a different origin is rejected without overwriting it', t => {
  const f = fixture(t);
  git(f.local, 'remote', 'set-url', 'origin', f.remote + '-another-repo');
  assert.throws(f.sync, /another repository/);
  assert.equal(git(f.local, 'remote', 'get-url', 'origin'), f.remote + '-another-repo');
});

test('a missing project directory is cloned with the current main', t => {
  const f = fixture(t);
  fs.rmSync(f.local, { recursive: true });
  const latest = f.update();
  assert.equal(f.sync().after, latest);
  assert.equal(git(f.local, 'status', '--porcelain'), '');
});

test('an occupied LOXX port is rejected instead of showing a previous server', async t => {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(3000, '127.0.0.1', resolve); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  await assert.rejects(assertPortsFree, /Port 3000 is busy/);
});

test('the Windows BAT wrapper executes from a path with spaces, unicode and an exclamation mark', { skip: process.platform !== 'win32' }, async t => {
  const f = fixture(t);
  const batch = path.join(f.base, 'download ! تست', 'START-LOXX.bat');
  fs.mkdirSync(path.dirname(batch));
  fs.writeFileSync(batch, content);
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(3000, '127.0.0.1', resolve); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', '""' + batch + '""'], {
    input: '\r\n', encoding: 'utf8', timeout: 30000, windowsVerbatimArguments: true,
    env: { ...process.env, LOXX_PROJECT_DIR: f.local, LOXX_RUNNING_COPY: '' }
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /Port 3000 is busy/);
  assert.match(result.stdout + result.stderr, /No older version was started/);
});
