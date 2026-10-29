@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title LOXX - Update and Launch
rem Run an immutable temporary copy: Git may replace this launcher during the update.
if defined LOXX_RUNNING_COPY goto LOXX_RUN
set "LOXX_ORIGINAL_FILE=%~f0"
set "LOXX_RUNNING_COPY=%TEMP%\LOXX-launcher-%RANDOM%-%RANDOM%.bat"
copy /y "%~f0" "%LOXX_RUNNING_COPY%" >nul
if errorlevel 1 (
  echo [ERROR] Could not create the temporary launcher.
  pause
  exit /b 1
)
"%LOXX_RUNNING_COPY%"
exit /b 1
:LOXX_RUN
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Install Node.js 22.12 or newer: https://nodejs.org
  pause
  del "%~f0" >nul 2>&1
  exit /b 1
)
set "LOXX_LAUNCHER_FILE=%LOXX_ORIGINAL_FILE%"
set "LOXX_PAYLOAD_FILE=%~f0"
node -e "const fs=require('node:fs');const s=fs.readFileSync(process.env.LOXX_PAYLOAD_FILE,'utf8');const tag='// LOXX_'+'EMBEDDED_NODE';const m={exports:{}};new Function('require','module',s.slice(s.lastIndexOf(tag)+tag.length))(require,m);m.exports.main().catch(e=>{console.error('\n[ERROR] '+e.message);console.error('The launcher stopped. No older version was started.');process.exitCode=1;});"
if errorlevel 1 (
  echo.
  echo See the launcher log path printed above for details.
  pause
  del "%~f0" >nul 2>&1
  exit /b 1
)
(
  del "%~f0" >nul 2>&1
  exit /b 0
)

// LOXX_EMBEDDED_NODE
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const net = require('node:net');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const REPOSITORY = 'https://github.com/mahdi007gamer/loxx.ir.git';
const BRANCH = 'main';
const exists = fs.existsSync;
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex');

function git(root, args, { allowFailure = false, log = () => {} } = {}) {
  const r = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 180000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  });
  if (r.error || r.status !== 0) {
    if (allowFailure) return null;
    const details = (r.stderr || r.stdout || r.error?.message || 'Git failed').trim();
    log(details);
    throw new Error('Git ' + args[0] + ' failed. Check the log, connection and GitHub access.');
  }
  return (r.stdout || '').trim();
}

function remoteIdentity(value) {
  return value.trim().replace(/^git@github\.com:/i, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//i, 'https://github.com/')
    .replace(/\.git\/?$/i, '').replace(/\/$/, '').toLowerCase();
}

function syncRepository(root, state, log, repository = REPOSITORY) {
  fs.mkdirSync(state, { recursive: true });
  const g = (args, extra = {}) => git(root, args, { log, ...extra });
  const id = stamp();
  if (!exists(root) || fs.readdirSync(root).length === 0) {
    fs.mkdirSync(path.dirname(root), { recursive: true });
    git(path.dirname(root), ['clone', '--single-branch', '--branch', BRANCH, repository, root], { log });
  }
  if (!exists(path.join(root, '.git'))) {
    const manifest = path.join(root, 'package.json');
    if (!exists(manifest) || JSON.parse(fs.readFileSync(manifest, 'utf8')).name !== 'loxx-platform') {
      throw new Error('This folder is not a LOXX project: ' + root);
    }
  } else {
    const top = g(['rev-parse', '--show-toplevel']);
    const real = value => process.platform === 'win32' ? fs.realpathSync(value).toLowerCase() : fs.realpathSync(value);
    if (real(top) !== real(root)) throw new Error('The project must be the repository root.');
    for (const name of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']) {
      const p = g(['rev-parse', '--git-path', name]);
      if (exists(path.resolve(root, p))) throw new Error('Finish the Git merge/rebase before updating.');
    }
    const origin = g(['remote', 'get-url', 'origin'], { allowFailure: true });
    if (origin && remoteIdentity(origin) !== remoteIdentity(repository)) {
      throw new Error('The origin remote belongs to another repository. No files were changed.');
    }
  }

  if (!exists(path.join(root, '.git')) || !g(['rev-parse', '--verify', 'HEAD'], { allowFailure: true })) {
    // ZIP installs have no history. Back up source and data before adopting Git.
    const backup = path.join(state, 'backups', 'before-git-' + id);
    fs.cpSync(root, backup, { recursive: true, filter: source => {
      if (source === root) return true;
      return !['.git', 'node_modules', '.next', 'dist'].includes(path.basename(source));
    } });
    log('ZIP/source backup: ' + backup);
    g(['init']);
    if (!g(['remote', 'get-url', 'origin'], { allowFailure: true })) g(['remote', 'add', 'origin', repository]);
    // Keep runtime files private even when an older ZIP lacks .gitignore.
    const exclude = path.resolve(root, g(['rev-parse', '--git-path', 'info/exclude']));
    fs.appendFileSync(exclude, '\nnode_modules/\n.next/\ndist/\n.env\n.env.local\n*.db\n*.db-*\n*.sqlite*\nLOCAL_LOGIN.txt\n*.log\n');
    g(['add', '--all']);
    g(['-c', 'user.name=LOXX Local Backup', '-c', 'user.email=local@loxx.invalid', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'Local ZIP backup before first GitHub sync']);
  }
  if (!g(['remote', 'get-url', 'origin'], { allowFailure: true })) g(['remote', 'add', 'origin', repository]);

  log('[1/5] Fetching the latest origin/main...');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      g(['fetch', '--no-tags', 'origin', '+refs/heads/' + BRANCH + ':refs/remotes/origin/' + BRANCH]);
      break;
    } catch (e) {
      log('Fetch attempt ' + attempt + '/3 failed.');
      if (attempt === 3) throw e;
    }
  }
  const target = g(['rev-parse', 'refs/remotes/origin/' + BRANCH]);
  const before = g(['rev-parse', 'HEAD']);
  const localMain = g(['rev-parse', '--verify', 'refs/heads/' + BRANCH], { allowFailure: true });
  const dirty = g(['status', '--porcelain', '--untracked-files=all']).length > 0;
  const branch = g(['branch', '--show-current']);
  if (dirty || before !== target) {
    const backupBranch = 'loxx-backup-' + id;
    g(['branch', backupBranch, before]);
    log('Previous revision preserved in Git branch: ' + backupBranch);
  }
  if (localMain && localMain !== before && localMain !== target) {
    const backupMain = 'loxx-main-backup-' + id;
    g(['branch', backupMain, localMain]);
    log('Previous main branch preserved in: ' + backupMain);
  }
  if (dirty) {
    g(['-c', 'user.name=LOXX Local Backup', '-c', 'user.email=local@loxx.invalid',
      'stash', 'push', '--include-untracked', '-m', 'LOXX before GitHub update ' + id]);
    log('Local edits saved in Git stash. Restore them later with git stash apply.');
  }
  if (branch !== BRANCH || before !== target || dirty) g(['checkout', '--force', '-B', BRANCH, target]);
  const after = g(['rev-parse', 'HEAD']);
  if (after !== target || g(['status', '--porcelain', '--untracked-files=all'])) {
    throw new Error('The local source does not match origin/main. Launch cancelled.');
  }
  log('Local commit:  ' + after);
  log('GitHub commit: ' + target + ' [MATCH]');
  log(g(['show', '-s', '--format=%ci  %s', 'HEAD']));
  fs.writeFileSync(path.join(state, 'version.json'), JSON.stringify({ commit: after, checkedAt: new Date().toISOString(), repository }, null, 2));
  return { before, after, dirty };
}

async function assertPortsFree() {
  for (const port of [3000, 4100]) {
    await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', () => reject(new Error('Port ' + port + ' is busy. Close the previous LOXX server window and run this file again.')));
      server.listen({ port, host: '127.0.0.1', exclusive: true }, () => server.close(resolve));
    });
  }
}

function npmCommand(args, root, log) {
  // Only fixed launcher-owned arguments enter the Windows command interpreter.
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const argv = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ' + args.join(' ')] : args;
  const child = spawn(command, argv, { cwd: root, windowsHide: true, stdio: ['inherit', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => log(data.toString().replace(/\s+$/, '')));
  const done = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  return { child, done };
}

function stopChild(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  else child.kill('SIGTERM');
}

function responds(url) {
  return new Promise(resolve => {
    const req = http.get(url, r => { r.resume(); resolve(r.statusCode >= 200 && r.statusCode < 400); });
    req.setTimeout(1500, () => req.destroy());
    req.on('error', () => resolve(false));
  });
}

async function main() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('Node.js 22.12 or newer is required.');
  const launcherDir = path.dirname(process.env.LOXX_LAUNCHER_FILE);
  const root = path.resolve(process.env.LOXX_PROJECT_DIR || (exists(path.join(launcherDir, 'package.json')) ? launcherDir : 'D:\\loxx\\website'));
  const state = path.join(path.dirname(root), '.loxx-launcher-' + path.basename(root));
  fs.mkdirSync(state, { recursive: true });
  const logfile = path.join(state, 'launcher-' + stamp() + '.log');
  const log = message => { console.log(message); fs.appendFileSync(logfile, message + os.EOL); };
  log('LOXX - GitHub update and local launch');
  log('Project: ' + root);
  log('Log: ' + logfile);
  const lock = path.join(state, 'launcher.lock');
  if (exists(lock)) {
    let running = false;
    try { process.kill(JSON.parse(fs.readFileSync(lock, 'utf8')).pid, 0); running = true; }
    catch (e) { if (e.code === 'EPERM') running = true; }
    if (running) throw new Error('Another LOXX launcher is running. Close its window first.');
    fs.unlinkSync(lock);
  }
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid }), { flag: 'wx' });
  let active;
  let interrupted = false;
  const onSignal = () => { interrupted = true; stopChild(active); };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  try {
    await assertPortsFree();
    git(os.tmpdir(), ['--version'], { log });
    syncRepository(root, state, log);
    if (!exists(path.join(root, 'package-lock.json'))) throw new Error('package-lock.json is missing. A reproducible install is required.');
    log('[2/5] Checking dependencies...');
    const inputs = ['package.json', 'package-lock.json', 'apps/api/package.json', 'apps/web/package.json'];
    const hash = crypto.createHash('sha256').update(process.version + process.platform + process.arch);
    for (const file of inputs) hash.update(fs.readFileSync(path.join(root, file)));
    const fingerprint = hash.digest('hex');
    const marker = path.join(state, 'dependencies.sha256');
    const installed = exists(path.join(root, 'node_modules', '.package-lock.json')) &&
      exists(path.join(root, 'node_modules', 'next', 'package.json')) && exists(marker) && fs.readFileSync(marker, 'utf8') === fingerprint;
    const run = async args => {
      const task = npmCommand(args, root, log);
      active = task.child;
      const result = await task.done;
      active = null;
      if (interrupted || result.code !== 0) throw new Error('npm ' + args.join(' ') + ' stopped or failed.');
    };
    if (!installed) {
      await run(['ci', '--no-audit', '--no-fund']);
      fs.writeFileSync(marker, fingerprint);
    } else log('Dependency versions unchanged; existing verified install reused.');
    log('[3/5] Removing generated build caches...');
    for (const file of ['apps/web/.next', 'apps/web/tsconfig.tsbuildinfo', 'apps/api/dist']) fs.rmSync(path.join(root, file), { recursive: true, force: true });
    log('[4/5] Preparing the local database...');
    await run(['run', 'setup:local']);
    if (interrupted) return;
    await assertPortsFree();
    log('[5/5] Starting the API and website...');
    const task = npmCommand(['run', 'dev'], root, log);
    active = task.child;
    let ended = false;
    task.done.then(() => { ended = true; }, () => { ended = true; });
    let ready = false;
    const deadline = Date.now() + 120000;
    while (!ended && !interrupted && Date.now() < deadline) {
      const health = await Promise.all([responds('http://127.0.0.1:3000'), responds('http://127.0.0.1:4100/api/health')]);
      if (health.every(Boolean)) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (interrupted) { await task.done; return; }
    if (!ready) throw new Error('The website/API did not become ready. See the log above.');
    log('READY: http://localhost:3000');
    log('Private admin details: ' + path.join(root, 'LOCAL_LOGIN.txt'));
    log('Keep this window open. Press Ctrl+C to stop.');
    if (process.platform === 'win32') {
      const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', 'http://localhost:3000'], { detached: true, stdio: 'ignore' });
      browser.on('error', () => log('Open http://localhost:3000 in your browser.'));
      browser.unref();
    }
    const result = await task.done;
    if (!interrupted && result.code !== 0) throw new Error('The LOXX server stopped unexpectedly.');
  } finally {
    stopChild(active);
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
    fs.rmSync(lock, { force: true });
  }
}

module.exports = { main, syncRepository, assertPortsFree };
